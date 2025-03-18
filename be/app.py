from payload import getRequestPayload
from flask import Flask, jsonify, request
from flask_cors import CORS
from mongo import vendors_collection
import time
import functools

app = Flask(__name__)
CORS(app)


def timer_decorator(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"API {func.__name__} executed in {end_time - start_time:.4f} seconds")
        return result
    return wrapper


@app.route("/")
def root():
    return jsonify({"message": "Hello World"})


@app.route("/vendors")
@timer_decorator
def vendors():
    req = None
    try:
        req = getRequestPayload(request)
    except:
        return jsonify({"error": "Invalid request parameters"}), 400
    
    vendors = vendors_collection.find({}, {
        "latitude": 1,
        "longitude": 1,
        "title": 1,
        "maxOfferPercent": 1,
        "details.offer.upperLimit": 1,
        "details.offer.lowerLimit": 1,
        })
    vendors_dto = []
    for vendor in vendors:
        if vendor["latitude"] < req.top_left_lat \
            and vendor["latitude"] > req.bottom_right_lat \
            and vendor["longitude"] > req.top_left_lng \
            and vendor["longitude"] < req.bottom_right_lng:
            vendors_dto.append({
                "lat": vendor["latitude"],
                "lng": vendor["longitude"],
                "name": vendor["title"],
                "off": int(vendor['maxOfferPercent']),
                "max": getOfferMax(vendor.get('details', {}).get('offer')),
                "min": getOfferMin(vendor.get('details', {}).get('offer')),
            })

    return jsonify({"vendors": [v for v in vendors_dto]})


def getOfferMax(offer) -> int | None:
    if not offer:
        return None
    
    try:
        return int(offer.get('upperLimit', 0)) or None
    except:
        return None

def getOfferMin(offer) -> int | None:
    if not offer:
        return None
    
    try:
        return int(offer.get('lowerLimit', 0)) or None
    except:
        return None

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
