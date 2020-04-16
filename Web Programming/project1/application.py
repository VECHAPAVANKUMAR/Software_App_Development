import os

from flask import Flask, session, request, render_template
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


# @app.route("/")
# def index():
    # return "Project 1: TODO"

@app.route("/")
@app.route("/register")
def index() :
    return render_template("register.html")

@app.route("/profile", methods=["GET","POST"])
def profile() :

    user_details = []

    name = request.form.get("name")
    user_details.append(name)

    emailID = request.form.get("emailID")
    user_details.append(emailID)

    dateOfBirth = request.form.get("dob")
    user_details.append(dateOfBirth)
    
    if request.form.get("male") == "on" :
        user_details.append("Male")
    elif request.form.get("female") == "on" :
        user_details.append("Female")
    else :
        user_details.append("Other")
        
    if request.method == "GET" :
        return render_template("register1.html")
    if request.method == "POST" :
        return render_template("profile.html", user_details=user_details)

if __name__ == "__main__" :
    app.run(debug=True)