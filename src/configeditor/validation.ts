import { BoundingBox } from "../util/bounds";
import { Config, TableTabConfigs, TableTabRowConfig } from "../types/config";
import { getTabKey } from "../providers/ConfigProvider";
import { Tab } from "../types/config";
import { isFeature, isFeatureCollection, validateGeometry } from "../util/geo";

/* The key of errors should relate to the place in the config object that the error
   refers to, with "/" in between.
   To make that easier to work with, there are "addError" and "getError" functions
   that take an array of strings or numbers as key instead.
 */

export interface ValidationErrors {
  [key: string]: string;
}

function _keysTokey(keys: (string | number)[]): string {
  return keys.map((key) => `${key}`).join("/");
}

function addError(errors: ValidationErrors, keys: (string | number)[], error: string): void {
  const key = _keysTokey(keys);
  errors[key] = error;
}

export function getError(errors: ValidationErrors, keys: (string | number)[]): string | undefined {
  const key = _keysTokey(keys);
  return errors[key];
}

function duplicates(strings: string[]) {
  return new Set(strings).size !== strings.length;
}

export function validate(config: Config) {
  const errors: ValidationErrors = {};

  if (config.dashboardTitle === "") {
    errors.dashboardTitle = "Dashboard title should not be empty.";
  }

  if (config.boundingBoxes) {
    // bounding boxes of different types of map
    const boundingBoxes = config.boundingBoxes as Config["boundingBoxes"];
    const defaultBounds = boundingBoxes.default ? new BoundingBox(...boundingBoxes.default) : null;
    const warningAreaBounds = boundingBoxes.warningAreas
      ? new BoundingBox(...boundingBoxes.warningAreas)
      : null;
    const rainMapBounds = boundingBoxes.rainMap ? new BoundingBox(...boundingBoxes.rainMap) : null;
    const floodModelMapBounds = boundingBoxes.floodModelMap
      ? new BoundingBox(...boundingBoxes.floodModelMap)
      : null;
    const damBounds = boundingBoxes.dams ? new BoundingBox(...boundingBoxes.dams) : null;

    validateBoundingBoxes("default", defaultBounds, errors);
    validateBoundingBoxes("warningAreas", warningAreaBounds, errors);
    validateBoundingBoxes("dams", damBounds, errors);
    validateBoundingBoxes("floodModelMap", floodModelMapBounds, errors);
    validateBoundingBoxes("rainMap", rainMapBounds, errors);
  }

  if (config.tabs) {
    validateTabs(config.tabs, errors);
  }

  validateTableTabConfigs(config.tableTabConfigs, errors);
  return errors;
}

function validateBoundingBoxes(type: string, bounds: BoundingBox | null, errors: ValidationErrors) {
  if (typeof errors.boundingBoxes === "string") return;

  const error = (e: string) => addError(errors, ["boundingBoxes", type], e);

  if (type === "default" && bounds === null) {
    error("Default field is required.");
  }

  if (bounds) {
    if (parseFloat(bounds.northmost) < parseFloat(bounds.southmost)) {
      error("North coordinate must be greater than South coordinate.");
    } else if (parseFloat(bounds.eastmost) < parseFloat(bounds.westmost)) {
      error("East coordinate must be greater than West coordinate.");
    } else if (
      parseFloat(bounds.westmost) < -180 ||
      parseFloat(bounds.westmost) > 180 ||
      parseFloat(bounds.eastmost) < -180 ||
      parseFloat(bounds.eastmost) > 180
    ) {
      error("West and East coordinates must be between -180° and 180°.");
    } else if (
      parseFloat(bounds.southmost) < -90 ||
      parseFloat(bounds.southmost) > 90 ||
      parseFloat(bounds.northmost) < -90 ||
      parseFloat(bounds.northmost) > 90
    ) {
      error("South and North coordinates must be between -90° and 90°.");
    } else if (!bounds.toConfigBbox().every((e) => e !== "")) {
      error("Please fill in all fields.");
    }
  }
}

function validateTabs(tabs: Tab[], errors: ValidationErrors) {
  // Per-tab errors
  tabs.forEach((tab) => validateTab(tab, errors));

  // Errors for all tabs
  let error = "";

  if (tabs.length === 0) {
    error += "There must be at least one tab. ";
  }
  if (duplicates(tabs.map(getTabKey))) {
    error += "The same tab can not occur twice. ";
  }
  if (duplicates(tabs.map((tab) => tab.title))) {
    error += "The same tab title can not be used twice. ";
  }

  if (error) {
    addError(errors, ["tabs"], error);
  }
}

function validateTab(tab: Tab, errors: ValidationErrors) {
  const tabKey = getTabKey(tab);

  let error = "";

  if (!tab.url) {
    error += "Tab type is required. ";
  }
  if (!tab.title) {
    error += "Title is required. ";
  }
  if (tab.url === "table" && !tab.slug) {
    error += "Table tab needs a slug. ";
  }
  if (tab.slug && !tab.slug.match(/^[a-z0-9]+$/)) {
    error += "Slugs can only contain lower case letters and digits. ";
  }

  if (error) {
    addError(errors, ["tabs", tabKey], error);
  }
}

function validateTableTabConfigs(tableTabConfigs: TableTabConfigs, errors: ValidationErrors) {
  // We run this for all table tab configs, but the assumption is that there is only
  // one (the one being edited) that can have errors. Little bit hacky but otherwise
  // the error object becomes more complicated still...

  Object.entries(tableTabConfigs).forEach(([tableTabKey, tableTabConfig]) => {
    validateTableRows(tableTabConfig.rows ?? [], tableTabKey, errors);
  });
}

function validateTableRows(
  rows: TableTabRowConfig[],
  tableTabKey: string,
  errors: ValidationErrors
) {
  rows.forEach((row) => {
    if (!row.name) {
      addError(
        errors,
        ["tableTabConfigs", tableTabKey, "rows", row.uuid],
        "Each row must have a name."
      );
    }
    if (row.mapGeometry) {
      try {
        const content = JSON.parse(row.mapGeometry);
        validateGeojson(content, (error: string) =>
          addError(errors, ["tableTabConfigs", tableTabKey, "rows", row.uuid, "mapGeometry"], error)
        );
      } catch (e) {
        addError(
          errors,
          ["tableTabConfigs", tableTabKey, "rows", row.uuid, "mapGeometry"],
          "Invalid JSON."
        );
      }
    }
  });

  if (duplicates(rows.map((row) => row.name))) {
    addError(errors, ["tableTabConfigs", tableTabKey, "rows"], "Row names must be unique.");
  }
}

function validateGeojson(json: any, errorFn: (error: string) => void) {
  if (isFeature(json)) {
    validateGeometry(json.geometry, errorFn);
  } else if (isFeatureCollection(json)) {
    json.features.map((feature) => validateGeometry(feature.geometry, errorFn));
  } else {
    errorFn("Not a GeoJSON Feature or FeatureCollection.");
  }
}
