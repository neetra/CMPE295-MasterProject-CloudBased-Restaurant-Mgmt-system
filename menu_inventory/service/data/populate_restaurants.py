import csv
import pandas as pd
import numpy as np
import os 
import requests
import configData;
dir_path = (os.path.dirname(os.path.realpath(__file__))) + '\\restaurants.csv'
print(dir_path)
restaurantNames = [] 

# opening the CSV file
with open(dir_path, mode ='r')as file:   
  # reading the CSV file
  csvFile = pd.read_csv(file)
  for name in  (csvFile['name']) :
    restaurantNames.append(name)
print(restaurantNames)

def addRestaurant(restaurantName):
  url = configData.BASEURL + '/restaurant'
  myObj = { "restaurantName" : restaurantName}
  response = requests.post(url, json = myObj)
  print(response.text)

for restaurantName in restaurantNames:
  addRestaurant(restaurantName)  