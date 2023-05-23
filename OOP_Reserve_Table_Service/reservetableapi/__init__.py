import logging
from flask import Flask
import os
from .routes import reservetable_api_blueprint


app = Flask(__name__)
logging.basicConfig(filename='record.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

#DB

secret_key = os.urandom(32)
app.config['SECRET_KEY'] = secret_key
with app.app_context():
  app.register_blueprint(reservetable_api_blueprint)


