import hashlib, binascii, os

from flask import Flask, session, request, render_template, flash, redirect, url_for
from flask_session import Session
from sqlalchemy.orm import scoped_session, sessionmaker
from models import *
from create import app
from datetime import timedelta
from sqlalchemy import or_, and_


app.secret_key = "1c488f4b4a21cd7fbc5007664656985c2459b2362cf1f88d44b97e750b0c14b2cf7bc7b792d3f45db"
app.permanent_session_lifetime = timedelta(minutes=30)

@app.route("/")
@app.route("/index")
def index() :
    return render_template("index.html")

@app.route("/register")
def register() :
    return render_template("register.html")

@app.route("/profile", methods=["GET","POST"])
def profile() :

    if request.method == "GET" :

        return render_template("register.html")

    if request.method == "POST" :

        name = request.form.get("name")

        emailID = request.form.get("emailID")

        password = request.form.get("pwd")

        dateOfBirth = request.form.get("dob")

        gender = request.form["options"]

        salt = hashlib.sha256(os.urandom(60)).hexdigest().encode('ascii')

        pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt, 100000)
        pwdhash = binascii.hexlify(pwdhash)

        password = (salt + pwdhash).decode('ascii')

        user = User(name=name, email=emailID, password=password, dateOfBirth=dateOfBirth, gender=gender)

        try :

            db.session.add(user)

            db.session.commit()

            return render_template("profile.html", name=name, email=emailID, dob=dateOfBirth, gender=gender)

        except Exception as exc:
            flash("An Account with same Email id alresdy exists", "info")
            return redirect("register")

@app.route("/login", methods=["GET", "POST"])
def login() :

    if request.method == "GET" :
        if session.get("user_email") :
            return redirect("search")
        else :
            return render_template("login.html")
    else :
        return render_template("login.html")

@app.route("/authenticate", methods=["GET", "POST"])
def authenticate() :

    if request.method == "POST" :

        emailID = request.form.get("emailID")
        user = User.query.filter_by(email=emailID).first()
        password = request.form.get("pwd")

        if user :

            salt = user.password[:64]
            stored_password = user.password[64:]

            pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), salt.encode('ascii'), 100000)
            pwdhash = binascii.hexlify(pwdhash).decode('ascii')

            if stored_password == pwdhash :
                session["user_email"] = user.email
                session.permanent=True
                flash("Login Succesful !", "info")
                return redirect("/search")
            else :
                flash("Please create an Account", "info")
                return redirect('register')
        else :
            flash("Please create an Account", "info")
            return redirect('register')
    else :

        if  session.get("user_email") :
            flash("Already Logged in !", "info")
            return redirect("/search")

        return render_template("login.html")

@app.route("/logout")
def logout() :

    if session.get("user_email") :
        session.pop("user_email", None)
        flash("You have been Logged out !")
        return redirect("login")
    else :
        flash("Please Login", "info")
        return redirect("login")

@app.route("/results", methods=["GET", "POST"])
def user() :

    if request.method == "POST" :

        if session.get("user_email") :
            query = request.form.get("search_item")
            query = "%{}%".format(query)
            books = Book.query.filter(or_(Book.isbn.ilike(query), Book.title.ilike(query), Book.author.ilike(query), Book.year.like(query)))
            session["query"] = query
            try :
                books[0].isbn
                return render_template("results.html", books=books)
            except Exception as exc :
                flash("No Results Found")
                return render_template("results.html", books=books)
        else :
            flash("Please Login", "info")
            return redirect(url_for("login"))

    else :
        if session.get("user_email") :
            query = session.get("query")
            books = Book.query.filter(or_(Book.isbn.like(query), Book.title.like(query), Book.author.like(query), Book.year.like(query)))
            return render_template("results.html", books=books)
        else :
            flash("Please Login", "info")
            return redirect(url_for("login"))

@app.route("/search", methods=["GET", "POST"])
def search() :

    if request.method == "GET" :

        if session.get("user_email") :
            return render_template("search.html")
        else :
            flash("Pleae Login", "info")
            return redirect("/login")
    if request.method == "POST" :
        return "POST"

@app.route("/book/<string:isbn>", methods=["GET", "POST"])
def bookpage(isbn) :
    if request.method == "POST":
        comments = request.form.get('textarea')
        rating = request.form.get('star')
        print(comments)
        print(rating)
        #now check if the reviewer has already commented
        if rating is None:
            rating=0
        review_data = Reviews.query.filter(and_(Reviews.isbn == isbn ,Reviews.emailid == session.get("user_email"))).first()
        if review_data is None:
            reviewobj = Reviews(isbn = isbn,emailid=session.get('user_email'),rating=rating,comments=comments)
            db.session.add(reviewobj)
            db.session.commit()
            print("inserted into db")
            existing_reviews = Reviews.query.filter_by(isbn =isbn).order_by(Reviews.timestamp.desc()).all()
            book_details = Book.query.get(isbn)
            return render_template("bookpage.html",details = existing_reviews , book = book_details)
        else:
            flash("You already reviewed this book  !")
            existing_reviews = Reviews.query.filter_by(isbn =isbn).order_by(Reviews.timestamp.desc()).all()
            book_details = Book.query.get(isbn)
            return render_template("bookpage.html",details = existing_reviews , book = book_details)

    elif request.method == "GET":
        # print("you are in the get method")
        if session.get('user_email') is  None:
            flash("You cannot view this page unless you login!")
            return redirect(url_for("login"))
        else:
            review_data = Reviews.query.filter(and_(Reviews.isbn == isbn ,Reviews.emailid == session.get("user_email"))).first()
            if review_data is not None:
                 flash("You already reviewed this book !")
            book_details = Book.query.get(isbn)
            existing_reviews = Reviews.query.filter_by(isbn =isbn).order_by(Reviews.timestamp.desc()).all()
            return render_template("bookpage.html",details = existing_reviews , book = book_details)
#             else:        
                    
                
#                 book_details = Book.query.get(isbn)
#                 existing_reviews = Reviews.query.filter_by(isbn =isbn).order_by(Reviews.timestamp.desc()).all()
#                 return render_template("bookpage.html",details = existing_reviews , book = book_details)
#             else:
#                 flash("You already reviewed this book !")
                
                


@app.route("/admin")
def admin() :
    if session.get("user_email") :
        users = User.query.order_by(User.timestamp.desc()).all()
        return render_template("admin.html", users=users)
    else :
        flash("Please Login First", "info")
        return redirect("/login")

if __name__ == "__main__" :
    app.run(debug=True)
