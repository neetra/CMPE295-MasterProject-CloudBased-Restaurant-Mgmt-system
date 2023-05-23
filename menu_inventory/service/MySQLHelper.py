import config
import pymysql.cursors

def createConnection():
        menumgt_db=pymysql.connect(host=config.db_host,user=config.db_username,password=config.db_password,database=config.db_database,
         cursorclass=pymysql.cursors.DictCursor
        )#established connection between your database  
        return menumgt_db   

def closeMysqlconnection(mysql_db : pymysql):
    if mysql_db:
            mysql_db.close()           
            
            print("MySQL connection is closed")

