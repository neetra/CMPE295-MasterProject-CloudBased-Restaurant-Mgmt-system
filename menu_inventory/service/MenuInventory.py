from configparser import Error

from logging import error
from flask import Flask, Response, request, current_app, jsonify, Blueprint, url_for, json
from flask_jwt import JWT, jwt_required
from pymysql import IntegrityError
from flask_sse import sse, Message;
import redis
from MySQLProvider import MySQLProvider
from datetime import datetime
from secrets import token_urlsafe;
from auth import example_blueprint;
import os, sys;
from flask_cors import CORS
import os, tempfile, zipfile

from Constants import JSONKeys
#from Models.User import User
from S3Handler import S3Handler

# Initialize mysql and s3 handlers
mysqlprovider = MySQLProvider()


# Initialise Flask APP
app = Flask(__name__)
app.config['SECRET_KEY'] = token_urlsafe(16) 

redisurl  =  "redis://" + "redisdemo.apdx1n.ng.0001.usw1.cache.amazonaws.com:6379"
#redisurl = "redis://" +"default:oQxfCJDoC8RW1TepITX7sIBATEAG9RZR@redis-19872.c289.us-west-1-2.ec2.cloud.redislabs.com:19872"

app.config["REDIS_URL"] = redisurl

red = redis.from_url(redisurl)
CORS(app)

# def event_stream():
#      # yield "data: Netra"
#     pubsub = red.pubsub()
#     pubsub.subscribe('sse')
#     # TODO: handle client disconnection.
#     for message in pubsub.listen():
#         if(message['type'] == 'message'):
#             msg_dict = json.loads(message['data'])        
#             yield str(str(Message(**msg_dict)))

def event_stream2():
     # yield "data: Netra"
    pubsub = red.pubsub()
    pubsub.subscribe('sse')
    # TODO: handle client disconnection.
    for message in pubsub.listen():
        if(message['type'] == 'message'):
            msg_dict = json.loads(message['data'])
            print(msg_dict)
            print((Message(**msg_dict)))
            return str(Message(**msg_dict))

@app.route('/pingRedis')
def publish_hello():
    try:     
        #red.publish('sse', "Hello!", type='greeting')   
        sse.publish({"message": "Hello!"}, type='greeting')  
        return "success"
    except redis.exceptions.ConnectionError as e:

        return {"message": e}, 400
    

# @app.route('/stream2')
# def stream():
#     return Response(event_stream(),
#                           mimetype="text/event-stream")   


@app.route('/stream3')
def stream2():
    return Response(event_stream2(),
                          mimetype="text/event-stream")                            
# JWT initialization
# jwt = JWT(app, authenticate, identity)
# jwt.jwt_payload_callback = make_payload

# # Sign up new user 
# @app.route('/create-user',  methods = ["POST"])
# def create_user():
#      print("create a user")
#      json_data = request.get_json()  
#      print(json_data)     
#      user  = mysqlprovider.create_user(json_data)
     
#      if user is None:
#          return "Bad request either username exist or password not valid",400
#      else:
#          return "User is created", 200

# def get_role_id(token):     
#     decoded_token = decode_token(token)
#     role_id =  decoded_token['role_id']
#     return role_id

# def get_email(token):     
#     decoded_token = decode_token(token)
#     return decoded_token['email']    

# def decode_token(token)   :      
#     try:          
#         token = token.split(" ")[1]
#         decode = jwt.jwt_decode_callback(token)
#         return decode;
#     except error as e:
#         return e        
    
# def getTokenFromAuthorizationHeader():
#     try:
#         token = request.headers["Authorization"]        
#         return token
#     except:
#         return "Error while parsing token"        

# # # create, edit new file , upload functionality
# # @app.route("/createfile", methods = ["POST"])
# # @jwt_required()
# # def create_a_file():  
# #     try:   
# #         # Lambda function has read-only access only temp directory     
# #         with tempfile.TemporaryDirectory() as tmpdir:
# #             print(tmpdir)
# #         token = request.headers["Authorization"]
# #         email = get_email(token) ;        
# #         f = request.files['file_key']        
# #         tmpdir = os.path.dirname(tmpdir)
# #         dirname = os.path.join(tmpdir, f.filename)      
# #         f.save(dirname);        
# #         file  = s3_handler.upload_file(dirname,email)          
# #         os.remove(dirname)         
# #         mysqlprovider.add_entry_of_file(file, email)        
# #         return "Success", 200
# #     except Error as err:
# #         return {"message":err.message},400       

# @app.route("/user/<username>")
# def get_user_details_by_userId_or_email(username):
#     try:
#         result = mysqlprovider.get_user_by_id_or_email(username)
#         return result
#     except Error as e:
#         return {"message" : e.message}        , 400



# @app.route("/user", methods =["POST"])
# def create_new_user():
#     try:
#         content = request.json
#         result = mysqlprovider.create_user(content)
#         return result
#     except IntegrityError as e:
#         return {"message" : e.args[1]}, 409        
#     except Error as e:
#         print(e.message)
#         return {"message" : e.message}, 409        

# @app.route("/pingToken")
# @jwt_required()
# def ping_validity_of_token():
#     try:        
#         return {"message" : "Success"}, 200
#     except Error as e:
#         return "Error " + e, 400

# @app.route("/ping")
# def ping():
#     try:           
#         return {'message' : 'success'}, 200
#     except Error as e:
#         return "Error " + e, 400


# @app.route("/pingRDS")
# def ping_RDS():
#     try: 
#         result  = mysqlprovider.get_sql_version()
#         if result is not None:          
#             return {'message' : 'success'}, 200
#         else :
#             return  {'message' : 'Cannot connect RDS'}, 500         
#     except Error as e:
#         return "Error " + e, 400        

@app.route("/")
def home():
    try:           
        return {'message' : 'Menu Inventory Service'}, 200
    except Error as e:
        return "Error " + e, 400  


@app.route("/pingRDS")
def pingRDS():
    try:           
         version = mysqlprovider.get_sql_version()
         return { "MYSQL VERSION " : version, "Connection" : "Success"}, 200
    except Error as e:
        return "Error " + e, 400  

@app.route("/pingS3")
def pingS3():
    try:           
        return {'message' : 'User Management Service'}, 200
    except Error as e:
        return "Error " + e, 400          

# @app.route("/tags")
# def get_tags()              :
#     try:
       
#         result = mysqlprovider.get_tags()
#         return jsonify(result)
#     except IntegrityError as e:
#         return {"message" : e.args[1]}, 409        
#     except Error as e:
#         print(e.message)
#         return {"message" : e.message}, 409   
 
# @app.route("/tag", methods = ["GET"])
# def get_tag()              :
#     try:
#         if request.method == "GET":
#             param= request.args['name']

#             result = mysqlprovider.get_tag(param)
#             return jsonify(result)
#     except IntegrityError as e:
#         return {"message" : e.args[1]}, 409        
#     except Error as e:
#         print(e.message)
#         return {"message" : e.message}, 409   

 
@app.route("/uploadImage", methods = ["POST"])
def upload_image()              :
    try:
        if request.method == "POST":
            f = request.files['file']
            s3handler = S3Handler();
            url = s3handler.upload_file(f)
            #result = mysqlprovider.get_tag(param)
            return jsonify({"imageLink": url})
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409   


@app.route("/restaurant", methods = ["POST", "GET", "DELETE", "PUT"])
def operations_restaurant()              :
    try:
        if request.method == "POST":
            jsonData = request.json          
            result = mysqlprovider.add_restaurant(jsonData)
            return jsonify(result)
        elif request.method == "GET":
            return jsonify({"message" :"get todo"}) 
        elif request.method == "DELETE":
            return jsonify({"message" :"delete todo"})           
        elif request.method == "PUT":         
            return jsonify({"message" :"updated todo"})                        
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409  
    

@app.route("/restaurants", methods = [ "GET"])
def operations_restaurants()              :
    try:
        results = mysqlprovider.get_all_restaurants()
        return jsonify(results)                        ;
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409      

@app.route("/categories", methods = [ "GET"])
def operations_categories()              :
    try:
        results = mysqlprovider.get_all_categories()
        return jsonify(results)                        ;
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409  
    
@app.route("/category", methods = ["POST", "GET", "DELETE", "PUT"])
def operations_category()              :
    try:
        if request.method == "POST":
            jsonData = request.json          
            result = mysqlprovider.add_category(jsonData)
            return jsonify(result)
        elif request.method == "GET":
            return jsonify({"message" :"get todo"}) 
        elif request.method == "DELETE":
            return jsonify({"message" :"delete todo"})           
        elif request.method == "PUT":         
            return jsonify({"message" :"updated todo"})                        
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409  
    
#TODO : Update
@app.route("/item", methods = ["POST", "GET", "DELETE", "PUT"])
def operations_item()              :
    try:
        if request.method == "POST":
            jsonData = request.json          
            result = mysqlprovider.add_menu_item(jsonData)
            return jsonify(result)
        elif request.method == "GET":
            itemId= request.args.get(JSONKeys.ItemIdParam)
            if itemId is not None:        
                result = mysqlprovider.get_item_by_id_or_name(itemId)
            else:
                itemName= request.args.get(JSONKeys.ItemNameParam)
                result = mysqlprovider.get_item_by_id_or_name(itemName, isName=True)     
            return jsonify(result)
        elif request.method == "DELETE":
            param= request.args.get(JSONKeys.ItemIdParam)           
            mysqlprovider.delete_item_by_id(param)
            msg = "Successfully deleted the item with id : " + param 
            return jsonify({"message" :msg})               
        elif request.method == "PUT":
            paramItemId = request.args.get(JSONKeys.ItemIdParam)
            paramRestuarntId = request.args.get(JSONKeys.RestaurantIdParam) 
            jsonData = request.json          
            result = mysqlprovider.update_menu_item(jsonData, paramItemId, paramRestuarntId)           
            return jsonify(result)                        
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409   

@app.route("/items", methods = ["GET"])
def get_all_items()              :
    try:
        if request.method == "GET" :  
            restaurantId = request.args.get(JSONKeys.RestaurantIdParam)
            if(restaurantId is not None):
                result = mysqlprovider.get_items_by_restaurant_id(restaurantId)
                return jsonify(result), 200
            result = mysqlprovider.get_all_items()
            return jsonify(result)
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409   


if __name__ == '__main__':
    # https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers
    app.run(port=5001)