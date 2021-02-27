import pyproj
import requests
import json

WGS84 = pyproj.Proj('+init=EPSG:4326')
GOOG = pyproj.Proj('+init=EPSG:3857')

def fix_json(original):
    original['bounding_box'] = [
        "150.96240520477298",
        "-33.81217200269498",
        "151.03141307830813",
        "-33.78071682642826"
    ]

    for tile in original['tiles']:
        if 'bbox' in tile:
            del tile['bbox']

        if tile['type'] == 'external' and 'api.flight.org' in tile['imageUrl']:
            tile['imageUrl'] = 'https://parramatta.lizard.net/media/projecten/parramatta_s0024/movie.gif'

    for tile in original['publicTiles']:
        if 'bbox' in tile:
            del tile['bbox']

    original['mapbox_access_token'] = "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImNrZWlnbHdycjFqNHMyem95cWFqNzhkc3IifQ.ymzd92iqviR5RZ-dd-xRIg"

    fwa = json.load(open('data/fwa_wgs84_1pc.json'))
    # for feature in fwa['features']:
    #     for polygon in feature['geometry']['coordinates']:
    #         for subpoly in polygon:
    #             for point in subpoly:
    #                 point[:] = pyproj.transform(GOOG, WGS84, *point)
    # del fwa['crs']
    # with open('data/fwa_wgs84.json', 'w') as f:
    #     json.dump(fwa, f)

    original['flood_warning_areas'] = fwa

    return original


original = requests.get('https://nxt3.staging.lizard.net/bootstrap/parramatta-dashboard/').json()['configuration']

result = fix_json(original)
print(json.dumps(result))
