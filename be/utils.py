def calculate_distance(lat1, lng1, lat2, lng2):
    from math import radians, cos, sin, asin, sqrt
    # convert decimal degrees to radians 
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    # haversine formula 
    dlon = lng2 - lng1 
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r
