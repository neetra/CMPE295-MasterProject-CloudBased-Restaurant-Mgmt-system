from configparser import Error
from tabnanny import check
from typing import Tuple
import mysql.connector 
from MySQLHelper import closeMysqlconnection, createConnection
from datetime import datetime
import config
from werkzeug.security import generate_password_hash, check_password_hash
from mysql.connector.cursor import MySQLCursorDict, MySQLCursorPrepared
import re

from Constants import JSONKeys
class MySQLProvider():   
   


    def get_sql_version(self, menuInventoryDbConnection= None):
        
        try:     
            menuInventoryDbConnection = createConnection()        
           
            
            my_cursor = menuInventoryDbConnection.cursor()
            
            query = "SELECT version()"
        
            
            my_cursor.execute(query)
            
            results = my_cursor.fetchone()
            if(results is None):
                return None

                         
            return results["version()"]               
        except mysql.connector.Error as err:
            print (err)     
        finally:
            closeMysqlconnection(menuInventoryDbConnection)                   
        
        return None



    def add_menu_item(self, itemData, menuInventoryDbConnection=None):
        try:
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None            
            with menuInventoryDbConnection.cursor() as my_cursor:  
                my_cursor.callproc('SP_AddMenuItem', ( itemData.get(JSONKeys.ItemName),itemData.get(JSONKeys.ItemPrice), 
                                                    itemData.get(JSONKeys.ItemImageLink), itemData.get(JSONKeys.ItemDescription),
                                                    itemData.get(JSONKeys.ItemCategoryId), itemData.get(JSONKeys.ItemRestaurntId))) 
                menuInventoryDbConnection.commit()               
                
                result = my_cursor.fetchone()            

            return result                
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMysqlconnection(menuInventoryDbConnection)     
        
    
    def get_item_by_id_or_name(self, itemId, isName = False,menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                    if(isName):
                        my_cursor.callproc('SP_GetMenuDetails', (None,itemId)) 
                    else:
                        my_cursor.callproc('SP_GetMenuDetails', (itemId,None))              
        
                    result = my_cursor.fetchall()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None
    
    def get_items_by_restaurant_id(self, restaurantId ,menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:            
                
                my_cursor.callproc('SP_GetAllMenuItemsByRestaurant', (restaurantId,)) 
                result = my_cursor.fetchall()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None


    def delete_item_by_id(self, itemId,menuInventoryDbConnection= None):
        try:             
            menuInventoryDbConnection = createConnection()    #established connection between your database   
           

            with menuInventoryDbConnection.cursor() as my_cursor:   
                
                    query = """DELETE from Items where Item_id = %s"""    
                    my_cursor.execute(query, itemId)                                           
                    menuInventoryDbConnection.commit()  
                          
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMysqlconnection(menuInventoryDbConnection)           
        
        return None 

        
    def get_all_items(self, menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                    my_cursor.callproc('SP_GetAllMenuItems')     ;         
        
                    result = my_cursor.fetchall()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None                  

    def add_restaurant(self, itemData ,menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                   
                my_cursor.callproc('Sp_Add_Restaurant', ( itemData.get(JSONKeys.RestaurantName), itemData.get(JSONKeys.RestaurantImageURL))) 
                menuInventoryDbConnection.commit()               
                
                result = my_cursor.fetchone()            
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None

    def get_all_restaurants(self, menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                    my_cursor.callproc('SP_GetAllRestaurants')     ;         
        
                    result = my_cursor.fetchall()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None
    def add_category(self, itemData ,menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                   
                my_cursor.callproc('SP_Add_Category', ( itemData.get(JSONKeys.CategoryName),)) 
                menuInventoryDbConnection.commit()               
                
                result = my_cursor.fetchone()            
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None
    
    def get_all_categories(self, menuInventoryDbConnection= None):
        try: 
            
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None
            with menuInventoryDbConnection.cursor() as my_cursor:              
                
                    my_cursor.callproc('SP_GetAllCategories')     ;         
        
                    result = my_cursor.fetchall()             
           
            return result                
        except mysql.connector.Error as err:
            print (err)
        finally:
            closeMysqlconnection(menuInventoryDbConnection)         
        
        return None   

    def update_menu_item(self, itemData, itemId, restaurantId, menuInventoryDbConnection=None):
        try:
            menuInventoryDbConnection = createConnection()     #established connection between your database   
            result =  None            
            with menuInventoryDbConnection.cursor() as my_cursor:     
                               

                my_cursor.callproc('SP_UpdateMenuItem', ( itemData.get(JSONKeys.ItemName),itemData.get(JSONKeys.ItemPrice), 
                                                    itemData.get(JSONKeys.ItemImageLink), itemData.get(JSONKeys.ItemDescription),
                                                    itemData.get(JSONKeys.ItemCategoryId), itemData.get(JSONKeys.ItemStockQuantity), 
                                                    itemId, restaurantId)) 
                menuInventoryDbConnection.commit()            
                result =  self.get_item_by_id_or_name(itemId)           
            return result                
        except mysql.connector.Error as err:
            return err.msg
        except Error as e:
            return e
        finally:
            closeMysqlconnection(menuInventoryDbConnection)     
        
     