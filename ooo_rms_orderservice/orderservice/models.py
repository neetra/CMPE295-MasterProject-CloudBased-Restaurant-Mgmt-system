import psycopg2
import psycopg2.extras

# Set up the connection parameters
dbname = "tablereservation"
user = "postgres"
password = "rms_password"
host = "cloud-rms.cgr3qmno03p6.us-west-1.rds.amazonaws.com"
port = "5432"
conn = ''

# Connect to the database
@staticmethod
def create_connection():
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
)
    return conn

@staticmethod
def add_order_data(order_id ,order_status , order_date ,table_id , order_amount):
 try:
    conn = create_connection()
    print(conn)
    cur = conn.cursor()
    insert_query = "INSERT INTO table_order (order_id,order_status,order_date,table_id,order_amount) VALUES (%s,%s,%s,%s,%s)"
    cur.execute(insert_query,(order_id,order_status,order_date,table_id,order_amount))
    conn.commit()
    cur.close()
    close_connection(conn)
 except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

@staticmethod
def add_order_details_data(order_id ,item_id,quantity, item_price ):
 try:
    conn = create_connection()
    cur = conn.cursor()
    insert_query = "INSERT INTO order_details (order_id,item_id,quantity,item_price) VALUES (%s,%s,%s,%s)"
    cur.execute(insert_query,(order_id,item_id,quantity,item_price))
    conn.commit()
    cur.close()
    close_connection(conn)
 except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

@staticmethod
def close_connection(conn):
 conn.close()

@staticmethod
def get_order_amount(order_id):
 try:
    conn = create_connection()
    cur = conn.cursor()
    select_query = "select order_amount from table_order where order_id = %s"
    cur.execute(select_query,(order_id,))
    result = cur.fetchone()
    cur.close()
    close_connection(conn)
    return result
 except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)


@staticmethod
def update_order_details(order_amount , order_id):
  try:
    conn = create_connection()
    cur = conn.cursor()
    update_query = "update table_order set order_amount = %s where order_id = %s"
    cur.execute(update_query , (order_amount , order_id ,))
    conn.commit()
    cur.close()
    close_connection(conn)
  except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)


@staticmethod
def get_order_info(order_id):
 try:
    conn = create_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    select_query = "select * from table_order where order_id = %s"
    cur.execute(select_query,(order_id,))
    column_names = [desc[0] for desc in cur.description]
    result = cur.fetchone()
    result_dict = {column_names[i]: result[i] for i in range(len(column_names))}
    cur.close()
    close_connection(conn)
    return result_dict
 except (Exception, psycopg2.Error) as error:
   print("Error fetching data from PostgreSQL table", error)

@staticmethod
def get_order_Items_info(order_id):
 try:
    conn = create_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    select_query = "select * from order_details where order_id = %s"
    cur.execute(select_query,(order_id,))
    items_list = []
    #column_names = [desc[0] for desc in cur.description]
    result = cur.fetchall()
    result_dict = {}
    for row in result:
      result_dict['order_details_id'] = row['order_details_id']
      result_dict['order_id'] = row['order_id']
      serializable_d = int(row['item_id']) 
      result_dict['item_id'] = serializable_d
      serializable_t = int(row['quantity']) 
      result_dict['quantity'] = serializable_t
      serializable_p = int(row['item_price']) 
      result_dict['item_price'] = serializable_p
      items_list.append(result_dict)
    cur.close()
    close_connection(conn)
    return items_list
 except (Exception, psycopg2.Error) as error:
        print("Error fetching data from PostgreSQL table", error)

@staticmethod
def close_connection(conn):
 conn.close()