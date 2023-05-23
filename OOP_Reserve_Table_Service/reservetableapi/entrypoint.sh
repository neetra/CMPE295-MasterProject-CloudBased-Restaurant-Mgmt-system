#!/bin/bash
export LC_ALL=en_US.UTF8
export LANG=en_US.UTF8
export FLASK_APP="/code/OOP_reserve_table_service/reservetableapi/main.py"
#export FLASK_APP="main.py"
export FLASK_ENV="development"
flask run --host=0.0.0.0 --port=8080