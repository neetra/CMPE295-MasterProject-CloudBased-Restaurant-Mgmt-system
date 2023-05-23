from configparser import Error
from tabnanny import check
from typing import Tuple
import mysql.connector 
from MySQLHelper import closeMySQLConnection, createConnection
from datetime import datetime
import config
from werkzeug.security import generate_password_hash, check_password_hash
from mysql.connector.cursor import MySQLCursorDict, MySQLCursorPrepared
import re

from Constants import JSONKeys, DefaultValues, SQLKeys
class MySQLProvider():   
  
# Define a function for
# for validating an Email 
 
    def check(self,email):
        try:
            regex = r'\b[A-Za-z0-9._%+-)+@[A-Za-z0-9.-)+\.[A-Z|a-z]{2,}\b'
        # pass the regular expression
        # and the string into the fullmatch() method
            if(re.fullmatch(regex, email)):
             return True;
    
            else:
                return False
        except Error as e:
            print(f"{e.message}")
            return False
        return False            
 
    def get_sql_version(self, UserMgtDbConnection= None):
        
        try:     
            UserMgtDbConnection = createConnection()        
           
            
            my_cursor = UserMgtDbConnection.cursor()
            
            query = "SELECT version()"
        
            
            my_cursor.execute(query)
            
            results = my_cursor.fetchone()
            if(results is None):
                return None

                         
            return results["version()"]              
        except mysql.connector.Error as err:
            print (err)     
        finally:
            closeMySQLConnection(UserMgtDbConnection)                   
        
        return None
            
    def get_user_details_by_identifier(self, userId = None, emailId = None, UserMgtDbConnection= None):
        try: 
          
            UserMgtDbConnection = createConnection()     #established connection between your database   
            result =  None
            with UserMgtDbConnection.cursor() as my_cursor:         
                    my_cursor.callproc('SP_GetUserByIdentifier', (userId,emailId))             
                    result = my_cursor.fetchone()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMySQLConnection(UserMgtDbConnection)         
        
        return None

    def add_new_user(self, user_l):
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
            StatusId =  user_l.get(JSONKeys.STATUSID) if user_l.get(JSONKeys.STATUSID) is not None else DefaultValues.STATUSID
            password = None
            roleId =  user_l.get(JSONKeys.ROLEID) if  user_l.get(JSONKeys.ROLEID) is not None else DefaultValues.ROLEID     
            
            with UserMgtDbConnection.cursor() as my_cursor:     
                isRoleAttrPresent = True if  JSONKeys.ROLEID in user_l.keys() else False;
                if isRoleAttrPresent:
                   roleId = user_l.get(JSONKeys.ROLEID)
                isStatusAttrPresent = True if  JSONKeys.STATUSID in user_l.keys() else False;
                if isStatusAttrPresent:
                   StatusId = user_l.get(JSONKeys.STATUSID)
                isPasswordAttrPresent = True if  JSONKeys.PASSWORD in user_l.keys() else False;
                if isPasswordAttrPresent:
                   password  = generate_password_hash(user_l.get(JSONKeys.PASSWORD))     

                                                     
                my_cursor.callproc('SP_AddNewUser', 
                        (
                        user_l.get(JSONKeys.FIRSTNAME),
                        user_l.get(JSONKeys.LASTNAME),                       
                        password,
                        user_l.get(JSONKeys.EMAIL),
                        roleId ,
                        StatusId,
                        user_l.get(JSONKeys.RESTAURANTID))) 
                UserMgtDbConnection.commit()
                result = my_cursor.fetchone()
                print(result)

            return result                
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)         
        
        return None

    def check_user_credentials(self, emailId, password = None, UserMgtDbConnection= None):        
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
            result =  None   

            with UserMgtDbConnection.cursor() as my_cursor:   
                
                    query = """SELECT Email, Password from Users where Email = %s LIMIT 1"""

    
                    my_cursor.execute(query, (emailId, ))

                    
                    result = my_cursor.fetchone()                            
                    actualPassword = check_password_hash(result[SQLKeys.PASSWORD],password)
            return result if (actualPassword or password == DefaultValues.NONEPASSWORD) else None;               
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)   
   
    def get_all_users(self, UserMgtDbConnection= None):        
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
            result =  None   

            with UserMgtDbConnection.cursor() as my_cursor:   
                
                    query = """SELECT u.User_id, u.First_name, u.Last_name, u.Email, r.Role_id, r.Role_name, s.Status_id, s.Status_name, urr.Restaurant_id FROM UserMgt.Users u 
                                LEFT JOIN UserMgt.UsersMappings um on um.User_id = u.User_id
                                LEFT JOIN Roles r on um.Role_id = r.Role_id
                                LEFT JOIN Status s on s.Status_id = um.Status_id
                                LEFT JOIN UserRestaurant urr on urr.User_id = u.User_id
                                """

    
                    my_cursor.execute(query)

                    
                    result = my_cursor.fetchall()                            
              
            return result;               
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)   

       
    def get_all_roles(self, UserMgtDbConnection= None):        
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
            result =  None   

            with UserMgtDbConnection.cursor() as my_cursor:   
                
                    query = """SELECT * from Roles"""

    
                    my_cursor.execute(query)

                    
                    result = my_cursor.fetchall()                            
              
            return result;               
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)         

    def get_all_status(self, UserMgtDbConnection= None):        
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
            result =  None   

            with UserMgtDbConnection.cursor() as my_cursor:   
                
                    query = """SELECT * from Status"""

    
                    my_cursor.execute(query)

                    
                    result = my_cursor.fetchall()                            
              
            return result;               
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)         


    def update_user_status(self, user_l ,UserMgtDbConnection =None):
        try: 
            
            UserMgtDbConnection = createConnection()     #established connection between your database   
           
            with UserMgtDbConnection.cursor() as my_cursor:     
                                                                    
                my_cursor.callproc('SP_UpdateUserStatus', 
                        (
                        user_l.get(JSONKeys.USERID, None),
                        user_l.get(JSONKeys.STATUSID, DefaultValues.STATUSID),                       
                      )) 
                UserMgtDbConnection.commit()
                result = my_cursor.fetchone()
                print(result)

            return result                
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMySQLConnection(UserMgtDbConnection)         
        
        return None

   