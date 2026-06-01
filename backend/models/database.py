from pymongo import MongoClient
from config.settings import Config

client = None
db = None


def init_db():
    global client, db
    client = MongoClient(Config.MONGO_URI)
    db = client.get_database()
    return db


def get_db():
    global db
    if db is None:
        init_db()
    return db
