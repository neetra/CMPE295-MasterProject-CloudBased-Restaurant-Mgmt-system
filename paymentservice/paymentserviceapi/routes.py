
import hvac
import boto3
from botocore.exceptions import ClientError
from flask import Flask, request, jsonify , json , Blueprint
import logging
import os
import stripe
from flask import jsonify , request
import psycopg2
import psycopg2.extras
from datetime import date
import random
from flask_cors import cross_origin

def get_secret():
    
    secret_name = "vault-token"
    region_name = "us-west-1"
    
    # Create a Secrets Manager client
    session = boto3.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId= secret_name
        )
    except ClientError as e:
        raise e

    # Decrypts secret using the associated KMS key.
    secret_key = get_secret_value_response['SecretString']
    return secret_key

# Set up the connection parameters
# Create a client to connect to Vault
client = hvac.Client(url='http://ec2-54-215-183-0.us-west-1.compute.amazonaws.com:8200')

# Authenticate to Vault using a token or other authentication method

client.token = get_secret()

# Read the secret values from the KV-v1 secret engine
secret_path = '/myapp'
secret = client.secrets.kv.v1.read_secret(secret_path)

# Extract the values from the secret dictionary
host = secret['data']['dbhost']
user = secret['data']['username']
password = secret['data']['password']
dbname = "tablereservation"
port = "5432"
conn = ''

payment_api_blueprint = Blueprint("paymentservice", __name__)


stripe_keys = {
    "secret_key": secret['data']['stripe_secret_key'],
    "publishable_key": secret['data']['stripe_publishable_key']
}


stripe.api_key = stripe_keys["secret_key"]

@payment_api_blueprint.route('/')
def payment_home_page():  # put application's code here
    return 'Welcome to payment home page'


def calculate_order_amount(order_id):
    #fetch the order amount from the db.
    order_amount = get_order_amount(order_id)
    order_amount = int(order_amount)
    return order_amount

@cross_origin()
@payment_api_blueprint.route('/create-payment-intent' , methods=['POST'])
def charge():  
    # Get the payment details 
    request_data = request.get_json()
    # Create a PaymentIntent with the order amount and currency
    try:
        intent = stripe.PaymentIntent.create(
            amount=calculate_order_amount(request_data['order_id']),
            currency='usd',
            automatic_payment_methods={
                'enabled': True,
            },
        )
        #add new payment 
        today = date.today()
        transaction_id = generate_random()
        add_new_payment(intent['id'],intent['amount'],request_data['order_id'],today,transaction_id)
        #update the payment db with successfull payments 

        update_payment_status_order(request_data['order_id'])
        client_secret = intent['client_secret']
        update_payment_id_order(request_data['order_id'],client_secret)

        #release the table 
        update_table_status(request_data['order_id'])

        #release table 
        update_release_flag_reservation(request_data['order_id'])

        return jsonify({
            'clientSecret': intent['client_secret']
        })
    except Exception as e:
        return jsonify(error=str(e)), 403





def generate_random():
    return random.randint(100000, 999999)

def create_connection():
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
)
    return conn

def close_connection(conn):
 conn.close()

def get_order_amount(order_id):
 try:
    conn = create_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    select_query = "select order_amount from table_order where order_id = %s"
    cur.execute(select_query,(order_id,))
    result = cur.fetchone()
    return result['order_amount']
 except (Exception, psycopg2.Error) as error:
   print("Error fetching data from PostgreSQL table", error)


def update_payment_status_order(order_id):
    try:
        conn = create_connection()
        cur = conn.cursor()
        update_query = "update table_order set payment_status ='Paid' where order_id = %s"
        cur.execute(update_query,(order_id,))
        update_query = "update table_order set order_status ='completed' where order_id = %s"
        cur.execute(update_query,(order_id,))
        conn.commit()
        cur.close()
        close_connection(conn)
    except (Exception, psycopg2.Error) as error:
     print("Error fetching data from PostgreSQL table", error)


def update_payment_id_order(order_id,payment_id):
    try:
        conn = create_connection()
        cur = conn.cursor()
        update_query = "update table_order set payment_id = %s where order_id = %s"
        cur.execute(update_query,(payment_id,order_id,))
        conn.commit()
        cur.close()
        close_connection(conn)
    except (Exception, psycopg2.Error) as error:
     print("Error fetching data from PostgreSQL table", error)

def add_new_payment(id, payment_amount, oder_id , payment_date, transaction_id):
    try:
        conn = create_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        Insert_query = "Insert into payment (id ,payment_amount,oder_id, payment_date,transaction_id) values (%s,%s,%s,%s,%s)"
        cur.execute(Insert_query,(id, payment_amount, oder_id , payment_date, transaction_id,))
        conn.commit()
        cur.close()
        close_connection(conn)
    except (Exception, psycopg2.Error) as error:
     print("Error fetching data from PostgreSQL table", error)

def update_table_status(order_id):
    try:
        conn = create_connection()
        cur = conn.cursor()
        select_query = "select table_id from table_order where order_id = %s"
        cur.execute(select_query,(order_id,))
        result = cur.fetchone()
        table_id =  int(result[0])
        print(table_id)
        update_query = "update table_store set table_status = 'available' where id= %s"
        cur.execute(update_query,(table_id,))
        conn.commit()
        cur.close()
        close_connection(conn)
    except (Exception, psycopg2.Error) as error:
     print("Error updating table status in table store", error)


def update_release_flag_reservation(order_id):
    try:
        conn = create_connection()
        cur = conn.cursor()
        select_query = "select table_id from table_order where order_id = %s"
        cur.execute(select_query,(order_id,))
        result = cur.fetchone()
        table_id =  int(result[0])
        update_query = "update reservation set released = 'TRUE' where table_id= %s "
        cur.execute(update_query,(table_id,))
        conn.commit()
        cur.close()
        close_connection(conn)
    except (Exception, psycopg2.Error) as error:
     print("Error updating  release flag in reservation PostgreSQL table", error)
