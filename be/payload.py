

class GetVendorsRequest:
    def __init__(self, top_left_lat, top_left_lng, bottom_right_lat, bottom_right_lng):
        self.top_left_lat = top_left_lat
        self.top_left_lng = top_left_lng
        self.bottom_right_lat = bottom_right_lat
        self.bottom_right_lng = bottom_right_lng


def getRequestPayload(request):
    top_left_lat = float(request.args.get("top_left_lat"))
    top_left_lng = float(request.args.get("top_left_lng"))
    bottom_right_lat = float(request.args.get("bottom_right_lat"))
    bottom_right_lng = float(request.args.get("bottom_right_lng"))
    if top_left_lat is None or top_left_lng is None or bottom_right_lat is None or bottom_right_lng is None:
        raise Exception("Invalid request parameters")

    return GetVendorsRequest(top_left_lat, top_left_lng, bottom_right_lat, bottom_right_lng)


