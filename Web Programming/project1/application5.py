import hashlib, binascii, os

from flask import Flask, session, request, render_template, flash, redirect, url_for, jsonify
from flask_session import Session
from sqlalchemy.orm import scoped_session, sessionmaker
from models import *
from create import app
from datetime import timedelta
from sqlalchemy import or_

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
                session.modified=True
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
            print("GET")
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
            return render_template("userHome.html")
        else :
            flash("Pleae Login", "info")
            return redirect("/login")

@app.route("/api/search", methods=["POST"])
def searchAPI() :
    
    print("/api/search" + str(request.is_json))
    if (not request.is_json) :
        return jsonify({"error" : "not a json request"}), 400

    reqData = request.get_json()

    if "search" not in reqData:
        return jsonify({"error" : "missing search param"}), 400
        
    value = reqData.get("search")

    if len(value) == 0 :
        return jsonify({"error" : "no results found"}), 404

    query = "%{}%".format(value)

    books = Book.query.filter(or_(Book.isbn.ilike(query), Book.title.ilike(query), Book.author.ilike(query), Book.year.like(query)))

    try :

        books[0].isbn

        results = []

        for book in books :

            temp = {}

            temp["isbn"] = book.isbn
            temp["title"] = book.title
            temp["author"] = book.author
            temp["year"] = book.isbn

            results.append(temp)

        return jsonify({"books" : results}), 200

    except Exception as exc :

        return jsonify({"error" : "Invalid Search Input"}), 404

@app.route("/api/book", methods=["GET"])
def apiBook() :

    if not request.is_json :
        return jsonify({"error" : "not a json request"}), 400

    if "isbn" not in request.args :
        return jsonify({"error" : "invalid param"}), 400

    isbn = request.args.get("isbn")
        
    book = Book.query.get(isbn)

    if book is None :
        return jsonify({"error" : "Invalid book isbn"}), 400

    reviews = Reviews.query.filter_by(isbn=isbn).order_by(Reviews.timestamp.desc()).all()

    results = []

    for review in reviews :
        temp = {}
        temp["isbn"] = review.isbn
        temp["email"] = review.emailid
        temp["comments"] = review.comments
        temp["rating"] = review.rating
        results.append(temp)

    return jsonify({
        "isbn" : book.isbn,
        "title" : book.title,
        "author" : book.author,
        "year" : book.year,
        "reviews" : results
    }), 200

# @app.route("/api/book/<string:isbn>", methods=["GET"]) 
# def bookAPI(isbn) :

#     if not request.is_json :
#         return jsonify({"error" : "not a json request"})
    
#     book = Book.query.get(isbn)

#     if book is None :
#         return jsonify({"error" : "Invalid book isbn"}), 400

#     reviews = Reviews.query.filter_by(isbn =isbn).order_by(Reviews.timestamp.desc()).all()

#     results = []

#     for review in reviews :
#         temp = {}
#         temp["isbn"] = review.isbn
#         temp["email"] = review.emailid
#         temp["comments"] = review.comments
#         temp["rating"] = review.rating
#         results.append(temp)

#     return jsonify({
#         "isbn" : book.isbn,
#         "title" : book.title,
#         "author" : book.author,
#         "year" : book.year,
#         "reviews" : results
#     }), 200

@app.route("/reviewsearch", methods = ["GET"])
def review_search():
    if request.method == "GET":
        if session.get("user_email"):
            return render_template("userreview.html")
        else :
            flash("Please Login First", "info")
            return redirect("/login")

@app.route("/api/userreview", methods=["POST"])
def userReviewAPI() :

    try :

        if not request.is_json :
            return jsonify({"error" : "not a json request"}), 400

        reqData = request.get_json()

        if "search" not in reqData :
            return jsonify({"error" : "missing search key"}), 400

        query = reqData.get("search")

        if len(query) == 0:
            return jsonify({"error" : "no results found"}), 404

        users = User.query.filter(or_(User.email.ilike(query), User.name.ilike(query))).all()
        rev = []
        
        for user in users:
            rev = rev + Reviews.query.filter_by(emailid=user.email).group_by(Reviews.emailid,Reviews.isbn).order_by(Reviews.timestamp.desc()).all()
        
        try:

            rev[0].isbn
            
            reviews = []

            for r in rev :

                temp = {}
                temp["isbn"] = r.isbn
                temp["emailid"] = r.emailid
                temp["rating"] = r.rating
                temp["comments"] = r.comments
                temp["timestamp"] = r.timestamp
                reviews.append(temp)

            return jsonify({"reviews" : reviews}), 200
        except Exception :
            return jsonify({"reviews" : "no reviews so far"}), 404
    except Exception :
        return jsonify({"error" : "Server Error"}), 500

@app.route("/api/submit_review", methods=["POST"])
def submitReviewAPI() :
    
    if not request.is_json :
        return jsonify({"error" : "not a json request"}), 400

    params = request.get_json()

    if "comment" not in params or "rating" not in params :
        return jsonify({"error" : "invalid param key"}), 400

    comment = request.json.get("comment")
    rating = request.json.get("rating")

    if comment is None or rating is None :
        return jsonify({"error" : "comment or rating atleast one is required"}), 400

@app.route("/api/submit_review", methods=["POST"])
def submitReviewAPI() :
    
    if not request.is_json :
        return jsonify({"error" : "not a json request"}), 400

    params = request.get_json()

    if "comment" not in params or "rating" not in params :
        return jsonify({"error" : "invalid param key"}), 400

    comment = request.json.get("comment")
    rating = request.json.get("rating")

    if comment is None or rating is None :
        return jsonify({"error" : "comment or rating atleast one is required"}), 400


@app.route("/book/<string:isbn>", methods=["GET", "POST"])
def bookpage(isbn) :

    if request.method == "GET" :
        if session.get("user_email") :
            book = Book.query.filter_by(isbn = isbn).first()
            # reviews = Review.query.filter_by(isbn=isbn).first().reviews
            # return render_template("reviews.html", isbn=isbn, book=book, reviews=["A", "B"], flag=True)
            name = User.query.filter_by(email=session.get("user_email")).first().name
            return render_template("reviews.html", book=book, reviews=["A", "B"], name=name, flag=True)

        else :
            redirect(url_for("login"))
    else :
        if session.get("user_email") :
            return isbn
        else :
            redirect(url_for("login"))
    
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
