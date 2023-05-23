import csv
import pandas as pd
import numpy as np
import os 
import requests
import configData;
import json




restaurantNamesAPI =[]


def read_restaurants_menu():
  # opening the CSV file
  dir_path = (os.path.dirname(os.path.realpath(__file__))) + '\\restaurant-menus.csv'
  with open(dir_path, mode ='r', encoding="utf-8")as file:   
    # reading the CSV file
    csvFile = pd.read_csv(file)
    return csvFile


def restuarnts():
  # opening the CSV file
  dir_path = (os.path.dirname(os.path.realpath(__file__))) + '\\restaurants.csv'
  with open(dir_path, mode ='r', encoding="utf-8")as file:   
    # reading the CSV file
    csvFile = pd.read_csv(file)
    return csvFile


def addCategory(categoryName):
  url = configData.BASEURL + '/category'
  myObj = { "categoryName" : categoryName}
  response = requests.post(url, json = myObj)
  print(response.text)


def addMenuItem(menuItem, rm):
  url = configData.BASEURL + '/item'
  if(menuItem['name']== 'Acai Berry Blend'):
    print('ddd')
  c = "Entrées" if menuItem['category'] == 'Entrees' else menuItem['category']
  category = [ct for ct in categoryAPI if ct['Category_description'].lower() == c.lower()]
  restaurant = [ct for ct in restaurantsAPI if ct['Restaurant_name'] == menuItem['rest_name'] ]
  des =  None if pd.isna(menuItem['description']) else menuItem['description']
  myObj ={
    "Item_description" : des,
    "Item_name" : menuItem['name'],
    "Item_price" : menuItem['price'],
    "Item_image_link" : "imagelink",
    "Item_Category_id" : (category[0])['Category_id'],
    "Item_restaurant_id" :(restaurant[0])['Restaurant_id']
}
  
  response = requests.post(url, json = myObj)

def addRow(row):
  rid = row['restaurant_id']
  if(rid == 22):
      print("ll")
  
  restName =  restuarnts[restuarnts['id'] == rid ]
  name = restName.iloc[0]["name"]
  return name

def getRestaurants():
  url = configData.BASEURL + '/restaurants'
  response = requests.get(url)
  return (response.text)

def getCategory():
  url = configData.BASEURL + '/categories'
  response = requests.get(url)
  return (response.text)

restaurantMenu = read_restaurants_menu()
print(restaurantMenu['category'])

# for ct in restaurantMenu['category']:
#   addCategory(ct)
restuarnts = restuarnts()

restaurantMenu['rest_name'] = restaurantMenu.apply(addRow, axis=1)
restaurantsAPI = json.loads(getRestaurants())
categoryAPI = json.loads(getCategory())

for rm in range(len(restaurantMenu.index)):  
  addMenuItem(restaurantMenu.iloc[rm], rm)