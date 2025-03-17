from flask import Flask, jsonify, request
from flask_cors import CORS
from mongo import vendors_collection
from utils import calculate_distance

app = Flask(__name__)
CORS(app)

@app.route("/")
def root():
    return jsonify({"message": "Hello World"})

@app.route("/vendors")
def vendors():
    top_left_lat = float(request.args.get("top_left_lat"))
    top_left_lng = float(request.args.get("top_left_lng"))
    bottom_right_lat = float(request.args.get("bottom_right_lat"))
    bottom_right_lng = float(request.args.get("bottom_right_lng"))
    
    vendors = vendors_collection.find({}, {"latitude": 1, "longitude": 1, "title": 1, "maxOfferPercent": 1})
    vendors_dto = []
    for vendor in vendors:
        if vendor["latitude"] < top_left_lat \
            and vendor["latitude"] > bottom_right_lat \
            and vendor["longitude"] > top_left_lng \
            and vendor["longitude"] < bottom_right_lng:
            vendors_dto.append({
                "lat": vendor["latitude"],
                "lng": vendor["longitude"],
                "name": vendor["title"],
                "off": int(vendor['maxOfferPercent']),
            })

    return jsonify({"vendors": [v for v in vendors_dto]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
