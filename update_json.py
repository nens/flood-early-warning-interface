import requests
import json

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

    for tile in original['publicTiles']:
        if 'bbox' in tile:
            del tile['bbox']

    original['mapbox_access_token'] = "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImNrZWlnbHdycjFqNHMyem95cWFqNzhkc3IifQ.ymzd92iqviR5RZ-dd-xRIg"

    return original


original = requests.get('https://nxt3.staging.lizard.net/bootstrap/parramatta-dashboard/').json()['configuration']

result = fix_json(original)
print(json.dumps(result))
