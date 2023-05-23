from flask import Flask, request, jsonify , json
from aifc import Error
import models , helpers  
from datetime import date
import functools
import logging
import jwt
from datetime import datetime, timedelta
import os
from decimal import Decimal

logging.basicConfig(filename='record.log', level=logging.DEBUG)
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(12).hex()



@app.route('/order')
def home_page():  # put application's code here
    return "welcome to order page"

@app.route('/order/home')
def generate_jwt_token():  # put application's code here
    #generates a JWT Token
  # Generate a new JWT token
    payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'sub': 'customer',
    }
    jwt_token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

    # Set the JWT token in the response
    response = jsonify({'message': 'JWT token created successfully', 
                       'jwt_token' : jwt_token})
    #store the jwt token in db
    response.set_cookie('jwt_token', jwt_token, httponly=True)

    # Return the response
    return response

    
@app.route('/order/createOrder',methods=['POST'])
def create_new_order():  # put application's code here
 if request.method == 'POST':
    Item = []
    order_amount = 0
    try:
        if request.method == 'POST':
            request_data = request.get_json()
            Item = request_data['Item']
            customer_phone = request_data['customer_phone']
            table_id = request_data['table_id']
            
            
            #calculate the order amount 
            
            for i in Item:
                order_amount = order_amount + (i['price'] * i['quantity'])
            order_id = helpers.generate_random()
            models.add_order_data(order_id ,"New", date.today() ,table_id , order_amount)
            app.logger.debug("Table_order table is updated successfully")
            
            #store the order item details in order_details table.
            for i in Item:
                models.add_order_details_data(order_id,i['Item_id'],i['quantity'],i['price'])
                app.logger.debug("Order details table is updated successfully")
            return jsonify({"message": "new order is created",
                            "order_id": order_id,
                            "table_id" :table_id,
                            "order_status": "New"}), 200

    except Error as e:
       return {"message": e.message}, 400
 else:
    return "Welcome to create order home page"


@app.route('/order/updateOrder', methods=['PUT'])
def update_order():  # put application's code here
    Item = []
    try:
        if request.method == 'PUT':
            request_data = request.get_json()
            print(request_data)
            order_id = request_data['order_id']
            Item = request_data['Item']
            
            #find the order amount for the existing order
            current_order_amount = models.get_order_amount(order_id)
            current_order_amount = functools.reduce(lambda sub, ele: sub * 10 + ele, current_order_amount)
            app.logger.debug(current_order_amount)
            for i in Item:
                current_order_amount = current_order_amount + (i['price'] * i['quantity'])
    
            #update the table_order 
            models.update_order_details(current_order_amount , order_id)
            app.logger.debug("Table_order table is updated successfully")
            #store the order item details in order_details table.
            for i in Item:
                models.add_order_details_data(order_id,i['Item_id'],i['quantity'],i['price'])
                app.logger.debug("Order details table is updated successfully")
            return jsonify({"message": "Updated the  order successfully",
                            "order_id": order_id}), 200
    except Error as e:
       return {"message": e.message}, 400


@app.route('/order/getOrderInfo/<order_id>', methods=['GET'])
def get_order_info(order_id):  # put application's code here
    try:        
      #find the order amount for the existing order
      order_info = models.get_order_info(order_id) 
      new_order_info = {}
      new_order_info['id'] = order_info['id']
      new_order_info['order_id'] = order_info['order_id']
      new_order_info['order_status'] = order_info['order_status']
      new_order_info['order_date'] = order_info['order_date']
      serializable_d = int(order_info['table_id']) 
      new_order_info['table_id'] = serializable_d
      new_order_info['payment_status'] = order_info['payment_status']
      new_order_info['order_details_id'] = order_info['order_details_id']
      new_order_info['payment_id'] = order_info['payment_id']
      serializable_order_amount = int(order_info['order_amount']) 
      new_order_info['order_amount'] = serializable_order_amount
      return jsonify(new_order_info), 200
    except Error as e:
       return {"message": e.message}, 400

@app.route('/order/getOrderItemsInfo/<order_id>', methods=['GET'])
def get_order_details_info(order_id):  # put application's code here
    try:        
      #find the order amount for the existing order
      order_details_info = models.get_order_Items_info(order_id) 
      print(order_details_info)  
      new_order_details_info = {}
      return jsonify(order_details_info), 200
    except Error as e:
       return {"message": e.message}, 400

def default_json(t):
    return f'{t}'    

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=8080)
