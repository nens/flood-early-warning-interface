import { Config } from "./types/config";

/* Note that for the edit pages to work, the default tabs must always
   include all available types of tab. */
export const DEFAULT_TABS = [
  {
    url: "alarms",
    title: "FloodSmart Warnings",
  },
  {
    url: "damalarms",
    title: "Dam Alarms",
  },
  {
    url: "waterlevel",
    title: "Flood Model",
  },
  {
    url: "rainfall",
    title: "Rainfall",
  },
  {
    url: "stations",
    title: "Stations & Graphs",
  },
  {
    url: "issuedwarnings",
    title: "Issued Warnings",
  },
];

export const ALL_TAB_URLS = [
  "alarms" /* Deprecated */,
  "damalarms" /* Deprecated */,
  "table" /* New */,
  "waterlevel",
  "rainfall",
  "stations",
  "issuedwarnings",
];

export const DEFAULT_CONFIG: Config = {
  version: 1,
  dashboardTitle: "FloodSmart dashboard",
  boundingBoxes: {
    default: [
      // Parramatta's
      "150.945110",
      "-33.796767",
      "151.072826",
      "-33.743612",
    ],
  },
  rasters: {
    // Parramatta's. Need to be made optional, see #62.
    rainForecast: "6ccb42ce-4e97-4376-b010-1b76a57b5253",
    operationalModelDepth: "fd8efbb8-2acd-4736-90aa-1c09b1f810e6",
    operationalModelLevel: "9fe0d03b-5d2a-4da4-8082-4aeff037fff5",
  },
  // The only key of this that is used is 'buildingsForFloodModelMap' -- make more generic
  // See ticket #66.
  wmsLayers: {},
  // Parramatta's rain legend, probably decent enough as a default.
  rainLegend: [
    ["<10 mm", "#FFFFFF"],
    ["10-20 mm", "#7DAED0"],
    ["20-30 mm", "#499ED7"],
    ["30-50 mm", "#2F82B3"],
    ["50-100 mm", "#BDB23B"],
    ["100-200 mm", "#EEA819"],
    ["200-300 mm", "#E75339"],
    ["300-500 mm", "#BE527D"],
    [">500 mm", "#9B59B6"],
  ],
  rainfallWmsLayers: [],
  rainPopupFields: [],
  mapbox_access_token: "",
  timeseriesForWarningAreas: {},
  dams: {
    type: "FeatureCollection",
    features: [],
  },
  tiles: [],
  flood_warning_areas: {
    type: "FeatureCollection",
    features: [],
  },
  trainingDashboards: [],
  /* Set explicitly to show it is not missing. Undefined means not fixed to a specific moment. */ nowDateTimeUTC:
    undefined,
  fakeData: {},
  rssUrl: "",
  extraRasters: {
    title: "",
    maps: {},
  },
  tabs: DEFAULT_TABS,
  infoImage: "",
  infoText: "",
  emergencyPlansText: "",
  tableTabConfigs: {},
};

export function getMapBackgrounds(access_token: string) {
  return [
    {
      description: "Labelled Satellite Map",
      url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8oabi090nys1imfdxgb6nv3/tiles/256/{z}/{x}/{y}@2x?access_token=${access_token}`,
    },
    {
      description: "Topographical Map",
      url: `https://api.mapbox.com/styles/v1/nelenschuurmans/ck8sgpk8h25ql1io2ccnueuj6/tiles/256/{z}/{x}/{y}@2x?access_token=${access_token}`,
    },
  ];
}

export const TRIGGER_LEVELS = ["minor", "moderate", "major", "monitor", "white", "amber", "red"];
