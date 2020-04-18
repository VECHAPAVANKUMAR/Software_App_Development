import csv
from create import app
from models import *

def main():
    f = open("books.csv")
    reader = csv.reader(f)
    c = 1
    for isbn, title, author, year in reader:
        if c == 1 :
            c == 0
            continue
        book = Book(isbn=isbn, title=title, author=author, year=year)
        db.session.add(book)
    db.session.commit()

if __name__=="__main__" :

    with app.app_context() :
        main()