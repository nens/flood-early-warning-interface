import { BoundingBox } from "../util/bounds";
import { Config } from "../types/config";
import { getTabKey } from "../providers/ConfigProvider";
import { Tab } from "../types/config";
import { PartialConfig } from "./hooks";

export interface ErrorObject {
  [key: string]: string;
}

export interface ValidationErrors {
  [key: string]: string | ErrorObject;
}

function duplicates(strings: string[]) {
  return new Set(strings).size !== strings.length;
}

export function validate(config: PartialConfig) {
  const errors: ValidationErrors = {};

  if (config.dashboardTitle === "") {
    errors.dashboardTitle = "Dashboard title should not be the empty string.";
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

  return errors;
}

function validateBoundingBoxes(type: string, bounds: BoundingBox | null, errors: ValidationErrors) {
  if (typeof errors.boundingBoxes === "string") return;

  if (type === "default" && bounds === null) {
    errors.boundingBoxes = {
      ...errors.boundingBoxes,
      [type]: "Default field is required.",
    };
  }

  if (bounds) {
    if (parseFloat(bounds.northmost) < parseFloat(bounds.southmost)) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: "North coordinate must be greater than South coordinate.",
      };
    } else if (parseFloat(bounds.eastmost) < parseFloat(bounds.westmost)) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: "East coordinate must be greater than West coordinate.",
      };
    } else if (
      parseFloat(bounds.westmost) < -180 ||
      parseFloat(bounds.westmost) > 180 ||
      parseFloat(bounds.eastmost) < -180 ||
      parseFloat(bounds.eastmost) > 180
    ) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: "West and East coordinates must be between -180° and 180°.",
      };
    } else if (
      parseFloat(bounds.southmost) < -90 ||
      parseFloat(bounds.southmost) > 90 ||
      parseFloat(bounds.northmost) < -90 ||
      parseFloat(bounds.northmost) > 90
    ) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: "South and North coordinates must be between -90° and 90°.",
      };
    } else if (!bounds.toConfigBbox().every((e) => e !== "")) {
      errors.boundingBoxes = {
        ...errors.boundingBoxes,
        [type]: "Please fill in all fields.",
      };
    }
  }
}

function validateTabs(tabs: Tab[], errors: ValidationErrors) {
  // Per-tab errors
  tabs.forEach((tab) => validateTab(tab, errors));

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
    errors.tabs = error;
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
    errors[tabKey] = error;
  }
}
