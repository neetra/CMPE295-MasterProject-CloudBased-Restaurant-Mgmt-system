from app import db
from database import db

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    menu_item_id = db.Column(db.String, nullable=False)
    restaurant_id = db.Column(db.String, nullable=False)
    user_id = db.Column(db.String, nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String(100), nullable=True)
    photo_id = db.Column(db.Integer, db.ForeignKey('photo.id'), nullable=True)
    photo = db.relationship("Photo", back_populates="review")

    def __init__(self, menu_item_id, restaurant_id, rating, user_id=None, comment=None, photo_id=None):
        self.menu_item_id = menu_item_id
        self.restaurant_id = restaurant_id
        self.user_id = user_id
        self.rating = rating
        self.comment = comment
        self.photo_id = photo_id

class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    menu_item_id = db.Column(db.String, nullable=False)
    restaurant_id = db.Column(db.String, nullable=False)
    user_id = db.Column(db.String, nullable=True)
    file_path = db.Column(db.String(200), nullable=False)
    upload_date = db.Column(db.DateTime, nullable=False)
    review = db.relationship("Review", back_populates="photo", uselist=False)

    def __init__(self, menu_item_id, restaurant_id, file_path, upload_date, user_id=None):
        self.menu_item_id = menu_item_id
        self.restaurant_id = restaurant_id
        self.user_id = user_id
        self.file_path = file_path
        self.upload_date = upload_date

class MenuItemSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    menu_item_id = db.Column(db.String, nullable=False)
    restaurant_id = db.Column(db.String, nullable=False)
    summary = db.Column(db.String, nullable=False)

    def __init__(self, menu_item_id, restaurant_id, summary):
        self.menu_item_id = menu_item_id
        self.restaurant_id = restaurant_id
        self.summary = summary

class ReviewCount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    menu_item_id = db.Column(db.String, nullable=False)
    restaurant_id = db.Column(db.String, nullable=False)
    count = db.Column(db.Integer, nullable=False, default=0)
    average_rating = db.Column(db.Float, nullable=False, default=0.0)

    def __init__(self, menu_item_id, restaurant_id, count=1, average_rating=0.0):
        self.menu_item_id = menu_item_id
        self.restaurant_id = restaurant_id
        self.count = count
        self.average_rating = average_rating