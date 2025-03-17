from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_DB_URL = os.getenv("MONGO_DB_URL")

client = MongoClient(MONGO_DB_URL)
db = client['zoodro']
vendors_collection = db['vendors']

