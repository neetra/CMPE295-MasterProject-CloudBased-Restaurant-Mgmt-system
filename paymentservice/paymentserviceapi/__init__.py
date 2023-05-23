import logging
from flask import Flask
import os
from .routes import payment_api_blueprint
from flask_cors import CORS, cross_origin

app = Flask(__name__)
cors = CORS(app)
logging.basicConfig(filename='record.log', level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

# Routes

secret_key = os.urandom(32)
app.config['SECRET_KEY'] = secret_key
app.config['CORS_HEADERS'] = 'Content-Type'
with app.app_context():
  app.register_blueprint(payment_api_blueprint)


