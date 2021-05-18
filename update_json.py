import pyproj
import requests
from requests.auth import HTTPBasicAuth
import json
import os
import sys

if len(sys.argv) <= 1:
    SLUG = 'parramatta-dashboard'
else:
    SLUG = sys.argv[1]

auth = HTTPBasicAuth(os.environ['PROXY_USERNAME'], os.environ['PROXY_PASSWORD'])

SERVER = 'https://parramatta.lizard.net/'

WGS84 = pyproj.Proj('+init=EPSG:4326')
GOOG = pyproj.Proj('+init=EPSG:3857')

RAINFALL_WMS = [
    {
        "title": "Rainfall since 9am",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_since9am"
    },
    {
        "title": "Rainfall forecast 3hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_forecast_3hr"
    },
    {
        "title": "Rainfall forecast 6hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_forecast_6hr"
    },
    {
        "title": "Rainfall forecast 12hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_forecast_12hr"
    },
    {
        "title": "Rainfall last hour",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_1hr"
    },
    {
        "title": "Rainfall last 3hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_3hr"
    },
    {
        "title": "Rainfall last 6hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_6hr"
    },
    {
        "title": "Rainfall last 12hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_12hr"
    },
    {
        "title": "Rainfall last 24hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_24hr"
    },
    {
        "title": "Rainfall last 48hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_last_48hr"
    },
    {
        "title": "Rainfall max 6hrs",
        "wms_url": "https://maps1.project.lizard.net/geoserver/v0227_parramatta_rainfall_db/wms",
        "wms_layers": "v0227_parramatta_rainfall_db:v0227_max6hrs"
    },
]

TIMESERIES_FOR_WARNING_AREAS = {
    'McCoy Park': 'dda9d1ae-df86-4dac-9931-e78e58a1a93f',
    'Toongabbie Creek': 'd6ef35c8-f61a-42e0-9bd6-0f26c5123439',
    'Lower Toongabbie and Wentworthville': '0de5c794-05cf-46cd-8ac5-00882ef371b7',
    'Westmead and North Parramatta': '88ddb4f6-8599-4890-9bb3-72727b27f3cf',
    'Darling Mills Creek': '1818a7e3-9994-400f-b8a4-c190f8102417',
    'Parramatta CBD': 'ce26f2e1-34c8-4fbb-abfa-204a06282f43',
    'Brickfields Creek': '1a7689f9-84fe-4d3a-948c-0a0540b69b2b'
}

RAIN_LEGEND = [
    ['<10 mm', '#FFFFFF'],
    ['10-20 mm', '#7DAED0'],
    ['20-30 mm', '#499ED7'],
    ['30-50 mm', '#2F82B3'],
    ['50-100 mm', '#BDB23B'],
    ['100-200 mm', '#EEA819'],
    ['200-300 mm', '#E75339'],
    ['300-500 mm', '#BE527D'],
    ['>500 mm', '#9B59B6']
]

DAMS = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "name": 'McCoy Park Basin',
                "timeseries": '0f0d0957-40af-4f7e-91bd-d4af804a9af6',
                "has_level_forecast": True,
            },
            "geometry": {"type": "Point", "coordinates": [150.952261633, -33.779484495, 0]},
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Lake Parramatta Dam",
                "timeseries": '0c11bc91-5222-4e65-ab66-f593f3cdc20a',
                "has_level_forecast": True,
            },
            'geometry': {"type": "Point", "coordinates": [151.006651, -33.791032, 0]},
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Loyalty Road Basin (owned by Local Land Services)",
                "timeseries": '937fcb8d-5d05-4803-9764-1ef55c01285e',
                "has_level_forecast": True,
            },
            "geometry": {"type": "Point", "coordinates": [151.005370013, -33.775744393, 0]},
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Muirfield Golf Course Basin",
                "timeseries": "1876ba4f-df16-4f52-8af6-7b6c50007c3f",
                "has_level_forecast": False,
            },
            "geometry": {"type": "Point", "coordinates": [151.01362, -33.76836, 0]},
        },
        {
            "type": "Feature",
            "properties": {
                "name": "Northmead Reserve Basin",
                "timeseries": "14d126e7-0e1d-47ba-9766-ab2c83f289b7",
                "has_level_forecast": False,
            },
            "geometry": {"type": "Point", "coordinates": [151.00133, -33.78144, 0]},
        }
    ]
}

RAIN_POPUP_FIELDS = [
    {
        "field": "descriptio",
        "description": "Catchment name",
        "type": "string"
    },
    {
        "field": "area",
        "description": "Catchment area",
        "type": "string"
    },
    {
        "field": "ner_l_1hr",
        "description": "1hr total",
        "type": "string"
    },
    {
        "field": "ner_l_3hr",
        "description": "3hr total",
        "type": "string"
    },
    {
        "field": "ner_l_6hr",
        "description": "6hr total",
        "type": "string"
    },
    {
        "field": "ner_l_12hr",
        "description": "12hr total",
        "type": "string"
    },
    {
        "field": "ner_l_24hr",
        "description": "24hr total",
        "type": "string"
    },
    {
        "field": "ner_l_48hr",
        "description": "48hr total",
        "type": "string"
    },
    {
        "field": "ner_f_3hr",
        "description": "Forecast 3hr total",
        "type": "string"
    },
    {
        "field": "ner_f_6hr",
        "description": "Forecast 6hr total",
        "type": "string"
    },
    {
        "field": "ner_f_12hr",
        "description": "Forecast 12hr total",
        "type": "string"
    },
    {
        "field": "max6hrs",
        "description": "72hr max 6hr total",
        "type": "string"
    },

]

def get_raster_uuid(short_uuid):
    # Returns actual uuid of short uuid
    if len(short_uuid) > 10:
        return short_uuid  # Already long

    raster = requests.get(SERVER + 'api/v3/rasters/' + short_uuid, auth=auth).json()
    return raster['uuid']


def fix_json(original):
    original['boundingBoxes'] = {
        'default': [
            "150.96240520477298",
            "-33.81217200269498",
            "151.03141307830813",
            "-33.78071682642826"
        ],
    }

    original['rasters'] = {
        'operationalModelLevel': "e7f7e720-da7b-44dd-a44e-c921f84bacbe",
        'operationalModelDepth': "091af242-27da-42a8-8771-cc729476cec7",
        'rainForecast': "6ccb42ce-4e97-4376-b010-1b76a57b5253"
    }

    original['wmsLayers'] = {
        'buildingsForFloodMap': {
            'wms': 'https://geoserver9.lizard.net/geoserver/parramatta/wms',
            'layer': 'cadaster',
            'styles': ''
        }
    }

    original['rainfallWmsLayers'] = RAINFALL_WMS
    original['dams'] = DAMS
    original['rainPopupFields'] = RAIN_POPUP_FIELDS
    original['rainLegend'] = RAIN_LEGEND

    for tile in (original['tiles'] + original['publicTiles']):
        if 'bbox' in tile:
            del tile['bbox']

        if tile['type'] == 'external' and 'api.flight.org' in tile['imageUrl']:
            tile['imageUrl'] = 'https://parramatta.lizard.net/media/projecten/parramatta_s0024/movie.gif'

        if 'rasterIntersections' in tile:
            for intersection in tile['rasterIntersections']:
                long_uuid = get_raster_uuid(intersection['uuid'])

                if long_uuid != intersection['uuid']:
                    intersection['uuid'] = long_uuid


    original['mapbox_access_token'] = "pk.eyJ1IjoibmVsZW5zY2h1dXJtYW5zIiwiYSI6ImNrZWlnbHdycjFqNHMyem95cWFqNzhkc3IifQ.ymzd92iqviR5RZ-dd-xRIg"

    fwa = json.load(open('data/fwa_wgs84_1pc.json'))
    for feature in fwa['features']:
        name = feature['properties']['name']
        feature['properties']['timeseries'] = TIMESERIES_FOR_WARNING_AREAS[name]

    # for feature in fwa['features']:
    #     for polygon in feature['geometry']['coordinates']:
    #         for subpoly in polygon:
    #             for point in subpoly:
    #                 point[:] = pyproj.transform(GOOG, WGS84, *point)
    # del fwa['crs']
    # with open('data/fwa_wgs84.json', 'w') as f:
    #     json.dump(fwa, f)

    original['flood_warning_areas'] = fwa

    if 'fakeData' in original:
        new_fake = dict()
        for key, value in original['fakeData'].items():
            if key.startswith('timeseries'):
                metadata = value['results'][0]
                uuid = key[len('timeseries-'):]
                # They re-used the same uuid everywhere...
                metadata['uuid'] = uuid

                # Events are now separate
                events = metadata['events']
                del metadata['events']

                last_value = metadata['last_value']
                try:
                    last_value = float(last_value)
                    metadata['last_value'] = last_value
                except ValueError:
                    pass

                # Save metadata and events separately, with events in v4 format
                new_fake['timeseries-metadata-' + metadata['uuid']] = metadata
                new_fake['timeseries-events-' + metadata['uuid']] = [
                    {'timestamp': event['timestamp'],
                     'max': float(event['max']) if event['max'] else None} for event in events
                ]
            else:
                new_fake[key] = value
        original['fakeData'] = new_fake

    return original


#original = requests.get('https://nxt3.staging.lizard.net/bootstrap/parramatta-dashboard/').json()['configuration']
original = requests.get('https://parramatta.lizard.net/bootstrap/'+SLUG+'/', auth=auth).json()['configuration']

result = fix_json(original)
print(json.dumps(result))
