import requests
import json

def fix_json(original):
    return original


original = requests.get('https://nxt3.staging.lizard.net/bootstrap/parramatta-dashboard/').json()['configuration']

result = fix_json(original)
print(json.dumps(result))
