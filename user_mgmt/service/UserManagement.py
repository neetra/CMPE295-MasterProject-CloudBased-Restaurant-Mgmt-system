from configparser import Error

from logging import error
from pymysql import IntegrityError
from flask import Flask, request, current_app, jsonify
from flask_jwt import JWT, jwt_required, current_identity
from Constants import JSONKeys, SQLKeys

from MySQLProvider import MySQLProvider
from datetime import datetime
from secrets import token_urlsafe;
import os, sys;
from flask_cors import CORS
import os, tempfile, zipfile

# Initialize mysql and s3 handlers
mySQLProvider = MySQLProvider()

#User Object for JWT authentication
class User(object):
    def __init__(self, user_id =None, email =None, first_name= None, last_name =None, role_id=None, status_id=None, Restaurant_id =None):
        self.User_id = user_id
        self.Email = email
        self.First_name = first_name
        self.Last_name = last_name
        self.Status_id = status_id
        self.Role_id = role_id
        self.Restaurant_id = Restaurant_id
    def __str__(self):
        return self.User_id

#Customize payload operation to encode role of the user.
def make_payload(identity :User):  
    iat = datetime.utcnow()
    exp = iat + current_app.config.get('JWT_EXPIRATION_DELTA')
    nbf = iat + current_app.config.get('JWT_NOT_BEFORE_DELTA')
    return {
        'exp': exp, 'iat': iat, 'nbf': nbf,
        'User_id': identity.User_id,     
        'First_name' : identity.First_name,
        'Last_name': identity.Last_name,
        'Email': identity.Email,
        'Role_id' : identity.Role_id,
        'Status_id' : identity.Status_id,
        'Restaurant_id' : identity.Restaurant_id,
        'Service':'RestaurantManagement'
        }  

def get_user_object(user):
    userObj = User()
    userObj.Email = user[SQLKeys.EMAIL]
    userObj.First_name = user[SQLKeys.FIRSTNAME]
    userObj.Last_name = user[SQLKeys.LASTNAME]
    userObj.Role_id = user[SQLKeys.ROLEID]
    userObj.User_id = user[SQLKeys.USERID]    
    userObj.Status_id = user[SQLKeys.STATUSid]
    userObj.Restaurant_id = user[SQLKeys.RESTAURANTId]
    return userObj

def authenticate(username, password =None):   
    # Get user details from mysql
    authorizedUser = mySQLProvider.check_user_credentials(emailId=username, password=password)
    if(authorizedUser is None):
        return None           

    user =mySQLProvider.get_user_details_by_identifier(emailId=username)
    userObj = get_user_object(user)
    return userObj

# This is called when jwt-required
def identity(payload):
    user_id = payload['User_id']
    user = mySQLProvider.get_user_details_by_identifier(userId=user_id)    
    if (user is None):
        return None  

    userObj =get_user_object(user=user)  
    return userObj;         

# Initialise Flask APP
app = Flask(__name__)
app.config['SECRET_KEY'] = token_urlsafe(16)  
#app.config['JWT_AUTH_URL_RULE'] = "/login"

# Enable CORS to all origins 
cors = CORS(app)

#JWT initialization
jwt = JWT(app, authenticate, identity)
jwt.jwt_payload_callback = make_payload

@app.route("/pingToken")
@jwt_required()
def ping_validity_of_token():
    try:        
         userId =  current_identity
         userObj = mySQLProvider.get_user_details_by_identifier(userId=userId)
         return userObj, 200
    except Error as e:
        return "Error " + e, 400
    
@app.route("/")
def home():
    try:           
        return {'message' : 'User Management Service'}, 200
    except Error as e:
        return "Error " + e, 400  

@app.route("/pingRDS")
def pingRDS():
    try:         
        sqlVersion = mySQLProvider.get_sql_version()
        return {'message' : 'User Management Service', 'version' : sqlVersion}, 200
    except Error as e:
        return "Error " + e, 400  



@app.route("/users")
def operation_users():
    try:         
        results = mySQLProvider.get_all_users()
        return jsonify(results), 200
    except Error as e:
        return "Error " + e, 400  


@app.route("/status",methods = ["Get"])
def operation_status():
    try:       
        
        results = mySQLProvider.get_all_status()
        return jsonify(results), 200
    except Error as e:
        return "Error " + e, 400   
    
@app.route("/roles",methods = ["Get"])
def operation_roles():
    try:       
        
        results = mySQLProvider.get_all_roles()
        return jsonify(results), 200
    except Error as e:
        return "Error " + e, 400  
       
@app.route("/user/status",methods = ["PUT"])
def operation_user_status():
    try:       
        updateStatusBody = request.json
        results = mySQLProvider.update_user_status(updateStatusBody)
        return jsonify(results), 200
    except Error as e:
        return "Error " + e, 400      
#TODO : Update, Delete
@app.route("/user", methods = ["POST", "GET", "DELETE", "PUT"])
def operations_user()              :
    try:
        if request.method == "POST":
            jsonData = request.json          
            result = mySQLProvider.add_new_user(jsonData)
            return jsonify(result)
        elif request.method == "GET":
            emailId= request.args.get(JSONKeys.EMAIL)
            userId =  request.args.get(JSONKeys.USERID)                  
            result = mySQLProvider.get_user_details_by_identifier(userId=userId, emailId =emailId)            
            return jsonify(result)
        # elif request.method == "DELETE":
        #     param= request.args.get(JSONKeys.ItemIdParam)           
        #     mySQLProvider.delete_item_by_id(param)
        #     msg = "Successfully deleted the item with id : " + param 
        #     return jsonify({"message" :msg})  
        # #TODO     
        # elif request.method == "PUT":
        #     param= request.args.get(JSONKeys.ItemIdParam) 
        #     jsonData = request.json          
        #    # mySQLProvider.delete_item_by_id(param)
            
        #     return jsonify({"message" :"updated todo"})                        
    except IntegrityError as e:
        return {"message" : e.args[1]}, 409        
    except Error as e:
        print(e.message)
        return {"message" : e.message}, 409  

#TODO : image upload
@app.route("/pingS3")
def pingS3():
    try:           
        return {'message' : 'User Management Service'}, 200
    except Error as e:
        return "Error " + e, 400          
       
if __name__ == '__main__':
    app.run()