import os
import uuid
import boto3
import requests
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv
from database import db
from configparser import Error
from models import Review, Photo, MenuItemSummary, ReviewCount
from openai_func import summarize_reviews_completion, summarize_reviews_chat_completion, chat

# Load environment variables
load_dotenv()

# Set up the Flask app
app = Flask(__name__)
CORS(app)

# Set up the AWS S3 client
s3 = boto3.client(
    "s3"
    # "s3",
    # region_name=os.environ["S3_REGION"],
    # aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    # aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"]
)

# Set up the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# API Endpoints
@app.route("/")
def test():
    try:           
        return {'message' : 'Restaurant Reviews Service'}, 200
    except Error as e:
        return "Error " + e, 400  
    
@app.route("/test_openai", methods=["POST"])
def openaiTest():
    my_review = request.form["test_review"]
    result = summarize_reviews_chat_completion(os.environ["OPENAI_API_KEY"], my_review)
    return jsonify(result)

@app.route("/test_https", methods=['POST'])
def httpsTest():
    test_url = request.form["test_url"]  # Any HTTPS enabled website
    test_result = test_https_connectivity(test_url)
    return test_result

def test_https_connectivity(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return f"Successfully connected to {url}"
        else:
            return f"Connection to {url} failed with status code {response.status_code}"
    except Exception as e:
        return f"Error connecting to {url}: {str(e)}"

# Upload photo
@app.route("/upload-photo", methods=['POST'])
def upload_photo():
    file = request.files.get("photo")

    if file:
        # Generate a unique file name and path to allow for photos with same name
        file_ext = file.filename.split(".")[-1]
        unique_id = uuid.uuid4()
        file_name = f"{unique_id}.{file_ext}"
        file_path = f"restaurant-photos/{file_name}"

        # Upload the photo to AWS S3
        try:
            s3.upload_fileobj(file, os.environ["S3_BUCKET"], file_path)
        except NoCredentialsError:
            return jsonify({"error": "S3 credentials error"}), 500
        
    photo_url = f"https://{os.environ['S3_BUCKET']}.s3.{os.environ['S3_REGION']}.amazonaws.com/{file_path}"
    return jsonify({"photo_url": photo_url}), 200

# Submit review
@app.route("/reviews/submit", methods=["POST"])
def submit_review():
    menu_item_id = request.form["menu_item_id"] # Required
    restaurant_id = request.form["restaurant_id"] # Required
    user_id = request.form.get("user_id") # Optional
    rating = int(request.form["rating"]) # Required
    comment = request.form.get("comment") # Optional
    file = request.files.get("photo") # Optional
    photo_id = None

    if file:
        # Generate a unique file name and path to allow for photos with same name
        file_ext = file.filename.split(".")[-1]
        unique_id = uuid.uuid4()
        file_name = f"{menu_item_id}-{restaurant_id}-{user_id or 'nouserid'}-{unique_id}.{file_ext}"
        file_path = f"photos/{file_name}"

        # Upload the photo to AWS S3
        try:
            s3.upload_fileobj(file, os.environ["S3_BUCKET"], file_path)
        except NoCredentialsError:
            return jsonify({"error": "S3 credentials error"}), 500

        # Save the photo URL and other details to the database
        photo = Photo(menu_item_id=menu_item_id, restaurant_id=restaurant_id, user_id=user_id, file_path=file_path, upload_date=datetime.utcnow())
        db.session.add(photo)
        db.session.commit()
        photo_id = photo.id

    # Save review data to the database
    review = Review(menu_item_id=menu_item_id, restaurant_id=restaurant_id, user_id=user_id, rating=rating, comment=comment, photo_id=photo_id)
    db.session.add(review)

    # Increment the review count for the specified menu item
    review_count = ReviewCount.query.filter_by(menu_item_id=menu_item_id, restaurant_id=restaurant_id).first()

    if not review_count:
        # Add new review count entry if it does not exist for the current menu item
        review_count = ReviewCount(menu_item_id=menu_item_id, restaurant_id=restaurant_id, average_rating=rating)
        db.session.add(review_count)
    else:
        # Calculate the new average rating for the specified menu item
        new_average_rating = (review_count.average_rating * review_count.count + rating) / (review_count.count + 1)
        review_count.average_rating = new_average_rating
        review_count.count += 1

    db.session.commit()

    # Update the summary for the menu item if the comment for the specified menu item is not empty
    if comment:
        update_menu_item_summary(menu_item_id, restaurant_id)

    return jsonify({"message": "Review submitted successfully!"}), 201

# Returns the average rating, total review count, and review summary of every existing menu item ID for the specified restaurant ID
@app.route("/reviews/menu_item_details/<restaurant_id>", methods=["GET"])
def get_all_menu_item_details(restaurant_id):
    # Get all of the average ratings, total review counts, and review summaries for the specified restaurant
    details = db.session.query(
        ReviewCount.menu_item_id,
        ReviewCount.average_rating,
        ReviewCount.count,
        MenuItemSummary.summary
    ).outerjoin(
        MenuItemSummary,
        db.and_(
            ReviewCount.restaurant_id == MenuItemSummary.restaurant_id,
            ReviewCount.menu_item_id == MenuItemSummary.menu_item_id
        )
    ).filter(
        ReviewCount.restaurant_id == restaurant_id
    ).all()

    # Only returns reviews that have a summary
    # ).filter(
    #     ReviewCount.restaurant_id == restaurant_id,
    #     MenuItemSummary.restaurant_id == restaurant_id,
    #     ReviewCount.menu_item_id == MenuItemSummary.menu_item_id
    # ).all()

    # Put the result into a JSON format
    result = [
        {
            "menu_item_id": menu_item_id,
            "restaurant_id": restaurant_id,
            "average_rating": round(average_rating, 2),
            "total_reviews": total_reviews,
            "summary": summary
        } for menu_item_id, average_rating, total_reviews, summary in details
    ]

    # Returns empty JSON array if no results
    return jsonify(result), 200

# Deletes all reviews associated with a specified menu item ID of a specified restaurant ID
@app.route("/reviews/delete/<restaurant_id>/<menu_item_id>", methods=["DELETE"])
def delete_menu_item(restaurant_id, menu_item_id):
    # Delete reviews associated with the menu item
    Review.query.filter_by(restaurant_id=restaurant_id, menu_item_id=menu_item_id).delete()

    # Delete photos associated with the menu item
    Photo.query.filter_by(restaurant_id=restaurant_id, menu_item_id=menu_item_id).delete()

    # Delete the review count associated with the menu item
    ReviewCount.query.filter_by(restaurant_id=restaurant_id, menu_item_id=menu_item_id).delete()

    # Delete the menu item summary associated with the menu item
    MenuItemSummary.query.filter_by(restaurant_id=restaurant_id, menu_item_id=menu_item_id).delete()

    db.session.commit()

    return jsonify({"message": "Menu item review data successfully deleted."}), 204

# Returns all the photos of a specific menu item ID of a specified restaurant ID
@app.route("/reviews/photos/<restaurant_id>/<menu_item_id>", methods=["GET"])
def get_photos(restaurant_id, menu_item_id):
    photos = Photo.query.filter_by(menu_item_id=menu_item_id, restaurant_id=restaurant_id).all()

    if photos:
        photo_urls = [f"https://{os.environ['S3_BUCKET']}.s3.{os.environ['S3_REGION']}.amazonaws.com/{photo.file_path}" for photo in photos]
        return jsonify({"menu_item_id": menu_item_id, "restaurant_id": restaurant_id, "photo_urls": photo_urls}), 200
    else:
        # Returns empty JSON object if no results
        return jsonify({}), 200

# Function to update a menu item's review summary
def update_menu_item_summary(menu_item_id, restaurant_id):
    # Get all comments for the specified menu item
    reviews = Review.query.filter_by(menu_item_id=menu_item_id, restaurant_id=restaurant_id).all()
    review_comments = [review.comment for review in reviews if review.comment]

    # If there are no reviews with any comments
    if not review_comments:
        summary = "No reviews with comments available."
    else:
        # Summarize the reviews using OpenAI API
        summary = summarize_reviews_chat_completion(os.environ["OPENAI_API_KEY"], review_comments)

    # Update the menu item summary in the database
    menu_item_summary = MenuItemSummary.query.filter_by(menu_item_id=menu_item_id, restaurant_id=restaurant_id).first()

    if not menu_item_summary:
        menu_item_summary = MenuItemSummary(menu_item_id=menu_item_id, restaurant_id=restaurant_id, summary=summary)
        db.session.add(menu_item_summary)
    else:
        menu_item_summary.summary = summary

    db.session.commit()

# Chat bot
@app.route('/chat', methods=['POST'])
def chat_route():
    messages = request.json['messages']
    
    chat_response = chat(os.environ["OPENAI_API_KEY"], messages)
    if chat_response is not None:
        return jsonify({"response": chat_response}), 200
    else:
        return jsonify({"error": "An error occurred processing your chat request."}), 500


# # # # # Miscellaneous API Endpoints # # # # #


# Returns the average ratings and total review count for all existing menu items of the specified restaurant ID
@app.route("/reviews/avg_ratings_and_count/<restaurant_id>", methods=["GET"])
def get_average_ratings_and_count(restaurant_id):
    # Get the average rating and total number of reviews for each menu item in the specified restaurant
    review_counts = ReviewCount.query.filter_by(restaurant_id=restaurant_id).all()

    # Put the result into a JSON format
    result = [
        {
            "restaurant_id": restaurant_id,
            "menu_item_id": review_count.menu_item_id,
            "average_rating": round(review_count.average_rating, 2),
            "total_reviews": review_count.count
        } for review_count in review_counts
    ]

    # Returns empty JSON array if no results
    return jsonify(result), 200

# Returns the review summary of all existing menu items of the specific restaurant
@app.route("/reviews/menu_item_summaries/<restaurant_id>", methods=["GET"])
def get_menu_item_review_summaries(restaurant_id):
    # Get the review summaries for the specified restaurant
    summaries = MenuItemSummary.query.filter_by(restaurant_id=restaurant_id).all()

    # Put the result into a JSON format
    result = [
        {
            "menu_item_id": summary.menu_item_id,
            "restaurant_id": summary.restaurant_id,
            "summary": summary.summary
        } for summary in summaries
    ]

    # Returns empty JSON array if no results
    return jsonify(result), 200

# Returns the review summary of a specific item at a specific restaurant
@app.route("/reviews/menu_item_summary/<restaurant_id>/<menu_item_id>", methods=["GET"])
def get_menu_item_summary(restaurant_id, menu_item_id):
    menu_item_summary = MenuItemSummary.query.filter_by(menu_item_id=menu_item_id, restaurant_id=restaurant_id).first()

    if menu_item_summary:
        return jsonify({"menu_item_id": menu_item_id, "restaurant_id": restaurant_id, "summary": menu_item_summary.summary}), 200
    else:
        # Returns empty JSON object if no results
        return jsonify({}), 200

# Returns all of the reviews of a specific restaurant by restaurant ID
@app.route("/reviews/<restaurant_id>", methods=["GET"])
def get_restaurant_reviews(restaurant_id):
    # Query the database for all reviews with the given restaurant_id
    reviews = Review.query.filter_by(restaurant_id=restaurant_id).all()

    # Put the result into a JSON format
    result = [
        {
            "id": review.id,
            "menu_item_id": review.menu_item_id,
            "restaurant_id": review.restaurant_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "photo_id": review.photo_id,
        }
        for review in reviews
    ]

    # Returns empty JSON array if no results
    return jsonify(result), 200

# Returns all of the reviews of a specific menu item by menu item ID
@app.route("/reviews/menu_item/<menu_item_id>", methods=["GET"])
def get_menu_item_reviews(menu_item_id):
    # Query the database for all reviews with the given menu_item_id
    reviews = Review.query.filter_by(menu_item_id=menu_item_id).all()

    # Put the result into a JSON format
    result = [
        {
            "id": review.id,
            "menu_item_id": review.menu_item_id,
            "restaurant_id": review.restaurant_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "comment": review.comment,
            "photo_id": review.photo_id,
        }
        for review in reviews
    ]

    # Returns empty JSON array if no results
    return jsonify(result), 200

if __name__ == "__main__":
    app.run(debug=True)