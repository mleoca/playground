import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

POSTGRES = {
    'user': os.getenv("POSTGRES_USER"),
    'pw': os.getenv("POSTGRES_PASSWORD"),
    'db': os.getenv("POSTGRES_DB"),
    'url': os.getenv("POSTGRES_URL"),
    'port': os.getenv("POSTGRES_PORT"),
}

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:%(pw)s@%(url)s:%(port)s/%(db)s' % POSTGRES

db = SQLAlchemy(app)
db.create_all()

from app import routes


app.run(debug=True)