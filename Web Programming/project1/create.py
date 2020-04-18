from flask import Flask, session, request, render_template
from models import *

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = 'postgres://wjavtdsrsdlnhq:88efd2f4f43aa6049fbb17fa29a7408de2eed8e1b3422c8e84f1e4dfca8ce2a1@ec2-54-88-130-244.compute-1.amazonaws.com:5432/d4sqhhsj9i5227'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

def main() :
    db.create_all()

if __name__ == "__main__" :

    with app.app_context() :
        main()