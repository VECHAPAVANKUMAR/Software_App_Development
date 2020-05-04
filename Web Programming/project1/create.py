from flask import Flask, session, request, render_template
from models import *

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = 'postgres://vuejcadeyapmgy:4611d56a979fbfe2b0d0defda8c63754572024ab8123f9c50646d3cc82153d1e@ec2-34-232-147-86.compute-1.amazonaws.com:5432/devmlrlifv3977'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

def main() :
    db.create_all()

if __name__ == "__main__" :

    with app.app_context() :
        main()