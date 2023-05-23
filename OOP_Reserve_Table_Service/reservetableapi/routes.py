from datetime import datetime ,timedelta
from pickle import NONE
from textwrap import indent
from flask import Blueprint, jsonify, request , g
from twilio.rest import Client
from aifc import Error
from reservetableapi.dbhelper import CREATEDBCONENNECTION
from functools import wraps
import random
from datetime import datetime ,timedelta
import functools



reservetable_api_blueprint = Blueprint("reservetableapi", __name__)

table_status = ['available', 'reserved', 'occupied','released']

#home page
@reservetable_api_blueprint.route('/', methods=['GET'])
@reservetable_api_blueprint.route('/home', methods=['GET'])
def get_table_reservation():
    try:
        return jsonify({"Message": "Welcome to reserve table"}), 200
    except:
        return jsonify({"Message": "reserve table page is unreachable"}), 400

def generate_random():
    return random.randint(100000, 999999)

#internal API call to add a table to the restaurant management global system.
@reservetable_api_blueprint.route('/addTable', methods=['POST'])
def add_table():
    try:
        if request.method == 'POST':
            request_data = request.get_json()
            restaurant_name = request_data['restaurant_name']
            table_name = request_data['table_name']
            table_location = request_data['table_location']
            table_capacity = request_data['table_capacity']
            table_id = generate_random()
            CREATEDBCONENNECTION.add_table_reservation(table_id,restaurant_name,table_name , table_location, table_capacity , table_status[0])
            return jsonify({
                "message": "table added successfully",
                "table": table_id
            }), 200
    except Error as e:
        return {"message": e.message}, 400

#Get table info from the table_store table.
@reservetable_api_blueprint.route('/getTableInfo', methods=['GET'])
def get_table_info():
    try:
     #table_info = table_store.query.all()  
     table_info = CREATEDBCONENNECTION.read_table_data()
     print(table_info)
     return jsonify(table_info) , 200
    except Error as e:
     return {"message": e.message}, 400 


# post reservation call , customer sends a request to make resrvation
@reservetable_api_blueprint.route('/newreservation', methods=['POST'])
def new_reservation():
    try:
        if request.method == 'POST':
            request_data = request.get_json()
            customer_name = request_data['customer_name']
            location = request_data['location']
            date = request_data['date']
            date = datetime.strptime(date , '%m-%d-%Y').date()
            time = request_data['time']
            time = datetime.strptime(time , '%H::%M').time()
            capacity = request_data['capacity']
            customer_phone = int(request_data['customer_phone'])

            #find available table for the customer
            available_table = CREATEDBCONENNECTION.get_available_table(capacity,location,table_status[0])
            available_table = functools.reduce(lambda sub, ele: sub * 10 + ele, available_table)
            table_serializable = int(available_table) 
            #assign the table to this customer and link the phone_number in reservation table .
            if available_table is NONE :
                return jsonify({"message": "no available table at this time please try again with different time or add to waitlist"})
            else:
                #add to reservation table and confirm the reservation by sending message.
                reservation_id = generate_random()
                 #change the table status to reserved 
                CREATEDBCONENNECTION.add_new_reservation(available_table,customer_phone,date,time,False,reservation_id)
                CREATEDBCONENNECTION.update_table_status(available_table,table_status[1])
                send_message_twillio(customer_phone , "Dear" + " "+customer_name+" "+ "your reservation is confirmed at:",  time) 
            return jsonify({"message": "new reservation added successfully",
                            "reservation_id" : reservation_id,
                            "table_id" :table_serializable}), 200   
    except Error as e:
        return {"message": e.message}, 400

#twilio information 
account_sid = 'ACbc33c039b0eae8b25d1d9b20641bcf16'
auth_token = '144ece660e20eb71e4c4783ebaaea776'
client = Client(account_sid, auth_token)
#send confirmation message to customer , twillio integeration
def send_message_twillio(phone_number , message ,time):
    time = time.strftime('%H:%M')
    try:
         if request.method == 'POST':
           message = client.messages.create(
                      from_='[+][1][8555062208]',
                      to=phone_number,
                      body=message+ ' ' +time)
         return jsonify({"message" : "message successfully sent"}), 200
    except Error as e:
     return jsonify({"Message": e.message}), 400  


     #get reservation info from the reservation table.
@reservetable_api_blueprint.route('/getCustomerReservation', methods=['GET'])
def get_all_reservation():
    try:
     reservation_info = CREATEDBCONENNECTION.read_reservation_data()
     print(reservation_info)
     return jsonify(reservation_info) , 200
    except Error as e:
     return {"message": e.message}, 400 

# post reservation call , add customer to waitlist
@reservetable_api_blueprint.route('/addToWaitlist', methods=['POST'])
def add_customer_waitlist():
    try:
        if request.method == 'POST':
            request_data = request.get_json()
            customer_name = request_data['customer_name']
            location = request_data['location']
            date = request_data['date']
            date = datetime.strptime(date , '%m-%d-%Y').date()
            time = request_data['time']
            time = datetime.strptime(time , '%H::%M').time()
            capacity = request_data['capacity']
            customer_phone = int(request_data['customer_phone'])
            

            #add the customer to waitlist
            waitlist_id = generate_random()
            CREATEDBCONENNECTION.add_customer_waitlist(waitlist_id, customer_phone , date , time,  location , capacity)
            message = "Dear Customer" + " " + customer_name+ " you are added in a waitlist for:"
            send_message_twillio(customer_phone , message, time)
            return jsonify({"message": "Customer added to waitlist",
                            "waitlist_id" :waitlist_id }), 200
    except Error as e:
        return {"message": e.message}, 400

# release table on when customer is done.- manual release 
# or later call this service with Payment .

@reservetable_api_blueprint.route('/releaseTable/<table_id>', methods=['PUT'])
def release_table(table_id):
    try:
       # update the table store and change status to available.
       rows_updated = CREATEDBCONENNECTION.release_table_update_status(table_id)
       reservation_rows = CREATEDBCONENNECTION.released_flag_reservation(table_id)
       return jsonify({"message": 'table'+ '  '+ table_id+ '  '+'is released for new customer',
                            "row updated" : rows_updated}), 200
    except Error as e:
        return {"message": e.message}, 400


#auto-pick customer from waitlist and assign a table with confirmation
@reservetable_api_blueprint.route('/assignTableWaitlistCustomer', methods=['POST'])
def assign_table_to_waitlist_customer():
    #get customer information from waitlist table
    try :
        waitlist_records = CREATEDBCONENNECTION.read_waitlist_records()
        print(waitlist_records)
        for record in waitlist_records:
            capacity = record['capacity']
            available_tables = CREATEDBCONENNECTION.get_available_table(capacity,record['location'],table_status[0])
            print(available_tables)
            time=record['time']
            phone = record['customer_phone']

            if available_tables==0 :
                return jsonify({"message": "no available table at this time"}) , 200
            else:
                reservation_id = generate_random()
                available_tables = functools.reduce(lambda sub, ele:sub*10 + ele , available_tables)
                available_tables = int(available_tables)
                print(available_tables)
                CREATEDBCONENNECTION.add_new_reservation(available_tables, record['customer_phone'] , record['date'] , record['time'] ,False,reservation_id)
                CREATEDBCONENNECTION.update_table_status(available_tables,table_status[1])
                #remove record from waitlist via custommer phone 
                CREATEDBCONENNECTION.remove_waitlist_record(record['waitlist_id'])
                send_message_twillio_waitlist(phone , "Dear customer" +" "+ "your reservation is confirmed for the requested time please arrive at the restaurant") 
                return jsonify({"message": "new reservation added successfully",
                                "confirmation_id" : reservation_id}), 200  
            # Create reservation record
            return "test"
    except Error as e:
        return {"message": e.message}, 400


def send_message_twillio_waitlist(phone_number , message):
    try:
         if request.method == 'POST':
           message = client.messages.create(
                      from_='[+][1][8555062208]',
                      to=phone_number,
                      body=message)
         return jsonify({"message" : "message successfully sent"}), 200
    except Error as e:
     return jsonify({"Message": e.message}), 400  