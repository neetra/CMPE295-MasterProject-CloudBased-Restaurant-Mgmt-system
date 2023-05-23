import psycopg2
from psycopg2.extras import DictCursor
from datetime import datetime ,timedelta


class CREATEDBCONENNECTION:

     
    @staticmethod
    def connect():
        conn = psycopg2.connect(
            host="cloud-rms.cgr3qmno03p6.us-west-1.rds.amazonaws.com",
            database="tablereservation",
            user="postgres",
            password="rms_password")
        return conn

    @staticmethod
    def close_connection(conn):
      conn.close()


    @staticmethod
    def read_table_data():
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor(cursor_factory =psycopg2.extras.DictCursor)
        cur.execute('select * from table_store')
        results = cur.fetchall()
        table_list=[]
        result_dict={}
        for table in results:
          id = table['id']
          table_id = int(id) 
          result_dict['id'] = table_id
          result_dict['restaurant_name']= table['restaurant_name']
          result_dict['table_name'] = table['table_name']
          result_dict['table_location']= table['table_location']
          capacity = table['table_capacity']
          capacity = int(capacity)
          result_dict['table_capacity'] = capacity
          result_dict['table_status']  = table['table_status']
          table_list.append(result_dict)
        return table_list 
     except (Exception, psycopg2.DatabaseError) as err:
         print(err)
     finally:
        CREATEDBCONENNECTION.close_connection(conn)
      

    @staticmethod
    def release_table_update_status(table_id):
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor(cursor_factory =DictCursor)
        print('updating the table_store table')
        sql = """ UPDATE table_store
                SET table_status = %s
                WHERE id = %s"""
        cur.execute(sql,('available',table_id))
        update_row = cur.rowcount
        conn.commit()
        cur.close()
     except (Exception, psycopg2.DatabaseError) as err:
        print(err)
        conn = None
        return "DB fetch failed"
     finally:
        print("connection closed")
        CREATEDBCONENNECTION.close_connection(conn, cur)
     return update_row


    @staticmethod
    def released_flag_reservation(table_id):
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor(cursor_factory =DictCursor)
        print('updating the table_store table')
        sql = """ UPDATE reservation
                SET released = %s
                WHERE id = %s"""
        cur.execute(sql,(True, table_id))
        update_row = cur.rowcount
        conn.commit()
        cur.close()
     except (Exception, psycopg2.DatabaseError) as err:
        print(err)
        conn = None
        return "DB fetch failed"
     finally:
        print("connection closed")
        CREATEDBCONENNECTION.close_connection(conn, cur)
     return update_row

    @staticmethod
    def get_customer_info_on_waitlist(table_capacity):
     try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         sql = """ select * from customer_waitlist where 
                   caapcity = %s
               """
         cur.execute(sql)
         waitlist_customers = cur.fetchone()
     except (Exception, psycopg2.DatabaseError) as err:
      print(err)
      conn = None
      return "DB fetch failed"
     finally:
        print("connection closed")
        CREATEDBCONENNECTION.close_connection(conn, cur)
     return waitlist_customers

    @staticmethod
    def add_table_reservation(table_id, restaurant_name,table_name , table_location, table_capacity , table_status):
     try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         insert_query = "INSERT INTO table_store (id, restaurant_name,table_name,table_location,table_capacity,table_status) VALUES (%s,%s,%s,%s,%s,%s)"
         cur.execute(insert_query,(table_id,restaurant_name,table_name,table_location,table_capacity,table_status))
         conn.commit()
         cur.close()
         CREATEDBCONENNECTION.close_connection(conn)
     except (Exception, psycopg2.Error) as error:
        print("Error adding table record in table_store table", error)

   

    @staticmethod
    def get_available_table(table_capacity, table_location ,table_status):
      try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         select_query = "select id from table_store where table_capacity = %s and table_location = %s and table_status = %s"
         cur.execute(select_query,(table_capacity,table_location,table_status,))
         result = cur.fetchone()
         cur.close()
         CREATEDBCONENNECTION.close_connection(conn)
         if result is None:
            return 0
         else:
            return result
      except (Exception, psycopg2.Error) as error:
            print("Error fetching available tables from Database", error)     


    @staticmethod
    def add_new_reservation(table_id, customer_phone,date ,time, released,reservation_id):
     try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         insert_query = "INSERT INTO reservation (table_id,customer_phone,date,time,released,id) VALUES (%s,%s,%s,%s,%s,%s)"
         cur.execute(insert_query,(table_id,customer_phone,date,time,released,reservation_id,))
         conn.commit()
         cur.close()
         CREATEDBCONENNECTION.close_connection(conn)
     except (Exception, psycopg2.Error) as error:
        print("Error adding table record in reservation table", error)     


    @staticmethod
    def update_table_status(table_id,table_status):
      try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         update_query = "update table_store set table_status = %s where id = %s"
         cur.execute(update_query , (table_status , table_id ,))
         conn.commit()
         cur.close()
         CREATEDBCONENNECTION.close_connection(conn)
      except (Exception, psycopg2.Error) as error:
            print("Error updating the table_store", error)

    @staticmethod
    def read_reservation_data():
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor(cursor_factory =psycopg2.extras.DictCursor)
        cur.execute('select * from reservation')
        results = cur.fetchall()
        reservation_list = []
        result_dict = {}
        for row in results:
         result_dict['id'] = row['id']
         table_id = row['table_id']
         table_serializable = int(table_id) 
         print(table_serializable)
         result_dict['table_id'] = table_serializable
         result_dict['customer_phone'] = row['customer_phone']
         date_str = row['date'].strftime("%Y-%m-%d")
         result_dict['date'] = date_str
         time_str = row['time'].strftime('%H:%M')
         result_dict['time'] = time_str
         result_dict['released'] = row['released']
         reservation_list.append(result_dict)
        return reservation_list 
     except (Exception, psycopg2.DatabaseError) as err:
         print(err)
     finally:
        CREATEDBCONENNECTION.close_connection(conn)

    @staticmethod
    def add_customer_waitlist(waitlist_id, customer_phone,date ,time, location,capacity):
     try:
         conn = CREATEDBCONENNECTION.connect()
         cur = conn.cursor()
         insert_query = "INSERT INTO waitlist (waitlist_id,customer_phone,date,time,location,capacity) VALUES (%s,%s,%s,%s,%s,%s)"
         cur.execute(insert_query,(waitlist_id,customer_phone,date,time,location,capacity,))
         conn.commit()
         cur.close()
         CREATEDBCONENNECTION.close_connection(conn)
     except (Exception, psycopg2.Error) as error:
        print("Error adding table record in reservation table", error)   

   
    @staticmethod
    def read_waitlist_records():
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor(cursor_factory =psycopg2.extras.DictCursor)
        cur.execute('select * from  waitlist')
        results = cur.fetchall()
        waitlist_list = []
        result_dict = {}
        for row in results:
         result_dict['waitlist_id'] = row['waitlist_id']
         result_dict['customer_phone'] = row['customer_phone']
         date_str = row['date'].strftime("%Y-%m-%d")
         result_dict['date'] = date_str
         time_str = row['time'].strftime('%H:%M')
         result_dict['time'] = time_str
         result_dict['location'] = row['location']
         capacity = row['capacity']
         capacity_serializable = int(capacity)
         result_dict['capacity'] = capacity_serializable
         waitlist_list.append(result_dict)
        return waitlist_list 
     except (Exception, psycopg2.DatabaseError) as err:
         print(err)
     finally:
        CREATEDBCONENNECTION.close_connection(conn)

    @staticmethod
    def remove_waitlist_record(waitlist_id):
     try:
        conn = CREATEDBCONENNECTION.connect()
        cur = conn.cursor()
        del_query = "delete from waitlist where waitlist_id= %s "
        cur.execute(del_query,(waitlist_id,))
        conn.commit()
        cur.close()
        CREATEDBCONENNECTION.close_connection(conn)
     except (Exception, psycopg2.Error) as error:
            print("Error updating the table_store", error)
        