import { useContext } from 'react';
import Plot from "react-plotly.js";
import { PlotData, Shape, Layout } from 'plotly.js';

import {
  BackgroundColorShape,
  ChartTile,
  LegendStyle,
  Threshold,
  Timeline
} from '../types/tiles';
import { ObservationType, Events, RasterAlarm } from '../types/api';
import { RectResult } from '../util/hooks';
import { isSamePoint } from '../util/bounds';
import { RectContext } from '../providers/RectProvider';
import { TimeContext } from '../providers/TimeProvider';
import {
  useRasterMetadata,
  useRasterAlarms,
  useRasterEvents,
  useTimeseriesMetadata,
  useTimeseriesEvents
} from '../api/hooks';

interface Props {
  tile: ChartTile;
  full?: boolean;
}

type Axes = [] | [ObservationType] | [ObservationType, ObservationType];

interface ObservationTypeHistorical {
  observationType: ObservationType;
  historical: boolean;
}

const TRIGGER_LEVEL_TO_COLOR: {[key: string]: string} = {
  major: "#f44",
  moderate: "#ffa544",
  minor: "#ff4",
  monitor: "#00477A",
  white: "#999",
  amber: "#ffa544",
  red: "#f44"
};

function _getAxes(observationTypes: ObservationTypeHistorical[]): Axes {
  // Only use normal types for deciding axes
  const types = observationTypes.filter(obsType => !obsType.historical).map(obsType => obsType.observationType);

  const first: ObservationType = types[0];

  if (!first) return [];

  for (let i=1; i < types.length; i++) {
    if (first.url !== types[i].url) {
      return [first, types[i]];
    }
  }
  return [first];
}

function getYAxis(observationType: ObservationType, side: "left"|"right") {
  const isRatio = observationType.scale === "ratio";

  return {
    title: observationType.unit || observationType.reference_frame,
    type: "linear" as const,
    rangemode: (isRatio ? "tozero" as const : "normal" as const),
    side: side,
    overlaying: side === 'right' ? ("y" as const) : undefined,
    ticks: "outside" as const,
    tick0: isRatio ? 0 : undefined,
    showgrid: side === 'left',
    zeroline: isRatio,
    range: observationType.unit === 'mm' ? [0, 15] : undefined
  };
}


function _getLegend(observationType: ObservationType, legendString: string | null) {
  let legend = legendString || observationType.parameter;

  if (observationType.unit) {
      return `${legend} (${observationType.unit})`;
  } else {
    return legend;
  }
}

function _getColor(colors: string[] | null, idx: number): string {
  if (colors && colors.length > idx) {
    return colors[idx]!;
  } else {
    return ["#26A7F1", "#000058", "#99f"][idx % 3]; // Some shades of blue
  }
}

function _getHistoricalColor(idx: number, amount: number) {
  // Most recent historical forecast (idx 0) should be dark grey (#606060),
  // least recent (idx amount-1) should be light gray (#eeeeee).
  // #60 = 96, #ee = 239.
  if (amount < 2) {
    return '#606060'; // There is only one, used darkest
  }
  if (idx >= amount) {
    return '#eeeeee'; // Should never happen
  }

  const value = Math.round(96 + (239-96) * (idx / (amount-1)));
  const hex = value.toString(16); // Should always be length 2

  return `#${hex}${hex}${hex}`;
}

function createVerticalLine(
  timeInEpoch: number,
  color: string,
  lineDash: Shape['line']['dash'],
  isFull: boolean,
  isRelativeTimeFromNow: boolean,
  now: number
) {
  return {
    type: "line" as const,
    layer: "above" as const,
    x0: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    x1: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    yref: "paper" as const,
    y0: 0,
    y1: 1,
    line: {
      dash: lineDash,
      color: color,
      width: isFull ? 2 : 1
    }
  };
}

function createAnnotationForVerticalLine(
  timeInEpoch: number,
  color: string,
  text: string,
  isRelativeTimeFromNow: boolean,
  now: number
) {
  return {
    text: text,
    bordercolor: color,
    x: isRelativeTimeFromNow ? now + timeInEpoch : timeInEpoch,
    xanchor: "right" as const,
    yref: "paper" as const,
    y: 1,
    yanchor: "top" as const,
    showarrow: false
  };
}

function backgroundColorBetweenTwoX(
  timeInEpoch1: number,
  timeInEpoch2: number,
  color: string,
  opacity: string,
  isRelativeTimeFromNow: boolean,
  now: number
) {
  /*
     This function creates a shape between 2 x values (with times in epoch)
     that will be used to show a different background color between these 2
     x values.
   */

  // Note we use layer 'below' to draw these *under* everything else. This is
  // also not perfect perhaps, but at least they aren't in front of the data.
  // If you (future me or someeone else) are going to work on this problem again,
  // see this excellent blog post:
  // https://medium.com/@tbarrasso/plotly-tip-2-svg-z-index-16c8a5125054
  // In short things are drawn in the order they appear in the source; but we
  // don't control much of that using React-Plotly.
  return {
    type: "rect" as const,
    xref: "x" as const,
    yref: "paper" as const,
    x0: isRelativeTimeFromNow ? now + timeInEpoch1 : timeInEpoch1,
    y0: 0,
    x1: isRelativeTimeFromNow ? now + timeInEpoch2 : timeInEpoch2,
    y1: 1,
    fillcolor: color,
    opacity: opacity,
    line: {
      width: 0
    },
    layer: 'below'
  };
}

function getThresholdLine(threshold: Threshold, yref: string) {
  return {
    type: "line" as const,
    layer: "above" as const,
    x0: 0,
    x1: 1,
    xref: "paper" as const,
    yref: yref,
    y0: threshold.value,
    y1: threshold.value,
    line: {
      width: 1,
      color: threshold.color
    }
  };
}

function getAlarmLines(alarm: RasterAlarm, yref: string) {
  return alarm.thresholds.map(threshold => {
    const color = (
      alarm.latest_trigger.warning_level === threshold.warning_level ?
      TRIGGER_LEVEL_TO_COLOR[threshold.warning_level!.toLowerCase()] :
      "#888"
    ) || "#888";

    return {
      type: "line",
      layer: "above",
      xref: "paper",
      x0: 0,
      x1: 1,
      yref,
      y0: threshold.value,
      y1: threshold.value,
      line: {
        dash: "dot",
        color,
        width: 2
      }
    };
  });
}

function getThresholdAnnotation(threshold: Threshold, yref: string) {
  return {
    text: " " + threshold.label + " ",
    bordercolor: threshold.color,
    xref: "paper",
    x0: 0,
    x1: 1,
    yanchor: "bottom" as const,
    yref: yref,
    y: parseFloat(threshold.value),
    showarrow: false
  };
}

function getAlarmAnnotations(alarm: RasterAlarm, yref: string) {
  return alarm.thresholds.map(threshold => {
    let active = "";
    let label = "";

    if (
      alarm.latest_trigger.warning_level === threshold.warning_level
    ) {
      const time = new Date(alarm.latest_trigger.value_time);
      active = `, active since ${time.toLocaleString()}`;
    }

    label = `${threshold.warning_level}${active}`;

    return {
      text: label,
      xref: "paper",
      x: 0,
      xanchor: "left",
      yref: yref,
      y: threshold.value,
      yanchor: "bottom",
      showarrow: false
    };
  });
}

function getAnnotationsAndShapes(
  axes: Axes,
  now: Date,
  thresholds: Threshold[],
  rasterAlarms: RasterObsType[],
  timelines: Timeline[],
  backgroundColorShapes: BackgroundColorShape[],
  full: boolean
) {
  let shapes = [];
  let annotations = [];
  let thresholdAnnotations;

  //  const alarmReferenceLines = alarmReferenceLines(axes);

  const thresholdLines = thresholds.map(th =>
    getThresholdLine(th, (axes.length === 2 && axes[1].unit === th.unitReference) ? "y2" : "y")
  );

  const rasterAlarmLines = rasterAlarms.map(alarm =>
    getAlarmLines(alarm.alarm, (axes.length === 2 && axes[1].unit === alarm.observationType.unit) ? "y2" : "y")
  ).flat();

  thresholdAnnotations = thresholds.map(th =>
    getThresholdAnnotation(
      th,
      (axes.length === 2 && axes[1].unit === th.unitReference) ? "y2" : "y"
    )
  );

  const rasterAlarmAnnotations = rasterAlarms.map(alarm =>
    getAlarmAnnotations(alarm.alarm,  (axes.length === 2 && axes[1].unit === alarm.observationType.unit) ? "y2" : "y")
  ).flat();

  /* if (alarmReferenceLines) {
     *   shapes = alarmReferenceLines.shapes;
     *   annotations = alarmReferenceLines.annotations;
     * } */

    // Return lines for alarms, ts thresholds and timelines

    // Timelines with annotation
    // Always show nowline
    const nowLine = createVerticalLine(
      0,
      "#C0392B", // red in Lizard colors
      "dot",
      full,
      true,
      now.getTime()
  );

  shapes.push(nowLine);

  const nowAnnotation = createAnnotationForVerticalLine(
    0,
    "#C0392B", // red in Lizard colors
    "NOW",
    true,
    now.getTime()
  );

  annotations.push(nowAnnotation);
  timelines.forEach(function(timeline) {
    const nowLine = createVerticalLine(
      timeline.epochTimeInMilliSeconds,
      timeline.color,
      timeline.lineDash,
      full,
      timeline.isRelativeTimeFromNow,
      now.getTime()
    );
    shapes.push(nowLine);
    const nowAnnotation = createAnnotationForVerticalLine(
      timeline.epochTimeInMilliSeconds,
      timeline.color,
      timeline.text,
      timeline.isRelativeTimeFromNow,
      now.getTime()
    );
    annotations.push(nowAnnotation);
  });

  // Background color shapes to show a certain background color between
  // two x axis values.
  backgroundColorShapes.forEach(function(backgroundColorShape) {
    const backgroundShape = backgroundColorBetweenTwoX(
      backgroundColorShape.x1EpochTimeInMilliSeconds,
      backgroundColorShape.x2EpochTimeInMilliSeconds,
      backgroundColorShape.color,
      backgroundColorShape.opacity,
      backgroundColorShape.isRelativeTimeFromNow,
      now.getTime()
    );
    shapes.push(backgroundShape);
  });

  if (thresholds) {
    thresholdLines.forEach(thLine => {
      shapes.push(thLine);
    });
    rasterAlarmLines.forEach(line => shapes.push(line));
    thresholdAnnotations.forEach(thAnnot => {
      annotations.push(thAnnot);
    });
    rasterAlarmAnnotations.forEach(annot => annotations.push(annot));
  }

  return { annotations, shapes };
}


function _getData(
  eventsArray: Events[],
  observationTypes: ObservationTypeHistorical[],
  numHistoricalTimeseries: number,
  axes: Axes,
  colors: string[] | null,
  legendStrings: string[] | null,
  full: boolean,
) {
  const normalEvents = eventsArray.length - numHistoricalTimeseries;

  return eventsArray.map((events, idx) => {
    const { observationType, historical } = observationTypes[idx];
    const legendString = (legendStrings !== null ? legendStrings[idx] : null);
    const color = (
      historical ?
      _getHistoricalColor(idx - normalEvents, numHistoricalTimeseries) :
      _getColor(colors, idx));

    const plotlyEvents: Partial<PlotData> = {
      x: events.map(event => event.timestamp),
      y: events.map(event => event.value),
      name: historical ? undefined : _getLegend(observationType, legendString),
      showlegend: !historical,
      hoverinfo: full && !historical ? "x+y+name": "none",
      hoverlabel: {
        namelength: -1
      }
    }

    if (axes.length > 1 && axes[1]!.url === observationType.url) {
      plotlyEvents.yaxis = "y2";
    }

    if (observationType.scale === 'ratio') {
      // Bar plot
      plotlyEvents.type = 'bar'
      plotlyEvents.marker = {
        color
      };
    } else {
      // Line plot
      plotlyEvents.type = "scatter";
      plotlyEvents.mode = "lines";
      plotlyEvents.line = {
        color
      };
    }
    return plotlyEvents;
  });
}


interface RasterObsType {
  alarm: RasterAlarm;
  observationType: ObservationType
}

function _getLayout(
    now: Date,
    start: Date,
    end: Date,
    full: boolean,
    showAxis: boolean,
    showLegend: boolean,
    width: number,
    height: number,
    axes: Axes,
    thresholds: Threshold[],
    timelines: Timeline[],
    rasterAlarms: RasterObsType[],
    backgroundColorShapes: BackgroundColorShape[],
    tileLegend?: LegendStyle
  ) {
  // We have a bunch of lines with labels, the labels are annotations and
  // the lines are shapes, that's why we have one function to make them.
  // Only full mode shows the labels.
  const annotationsAndShapes = getAnnotationsAndShapes(
    axes,
    now,
    thresholds,
    rasterAlarms,
    timelines,
    backgroundColorShapes,
    full
  );

  const margin = (
    (full || showAxis) ?
    {
      t: 20,
      l: 50,
      r: 50,
      b: 40
    } : {
      t: 5,
      l: 5,
      r: 5,
      b: 5
    }
  );

  // Use the tile configuration for some of the configuration.
  // Use the react-plotly default (undefined), if no configuration is set.

  const layout: Partial<Layout> = {
    width: width,
    height: height,
    showlegend: full && showLegend,
    legend: {
      x: tileLegend && tileLegend.x ? tileLegend.x : 0.02, // 1.02 is default
      xanchor:
         tileLegend && tileLegend.xanchor ? tileLegend.xanchor : undefined, // left is default
      y: tileLegend && tileLegend.y ? tileLegend.y : 1, // 1 is default
      yanchor:
         tileLegend && tileLegend.yanchor ? tileLegend.yanchor : undefined, // auto is default
      borderwidth:
         tileLegend && tileLegend.borderwidth ? tileLegend.borderwidth : 1,
      bordercolor:
          tileLegend && tileLegend.bordercolor
          ? tileLegend.bordercolor
          : undefined,
      bgcolor:
          tileLegend && tileLegend.bgcolor ? tileLegend.bgcolor : undefined,
      font: {
        family:
            tileLegend && tileLegend.font && tileLegend.font.family
            ? tileLegend.font.family
            : undefined,
        size:
            tileLegend && tileLegend.font && tileLegend.font.size
            ? tileLegend.font.size
            : undefined, // 12
        color:
            tileLegend && tileLegend.font && tileLegend.font.color
            ? tileLegend.font.color
            : undefined
      },
    },
    margin: margin,
    xaxis: {
      visible: showAxis,
      type: "date" as const,
      showgrid: true,
      range: [start, end]
    },
    // False makes it unable to interact with the graph when displayed as tile
    dragmode: full ? "zoom" as const : false as const, // default is "zoom"
    shapes: annotationsAndShapes.shapes,
    annotations: full ? annotationsAndShapes.annotations : []
  };

  if (axes.length >= 1) {
    layout.yaxis = {
      ...getYAxis(axes[0]!, "left"),
      fixedrange: true,
      visible: showAxis
    };
  }
  if (axes.length >= 2) {
    layout.yaxis2 = {
      ...getYAxis(axes[1]!, "right"),
      fixedrange: true,
      visible: showAxis
    };
  }

  return layout;
}


function TimeseriesTile({tile, full=false}: Props) {
  const { now, start, end } = useContext(TimeContext);
  const { rect } = useContext(RectContext) as {rect: RectResult};

  const rasterMetadata = useRasterMetadata(
    (tile.rasterIntersections || []).map(intersection => intersection.uuid)
  );
  const timeseriesMetadata = useTimeseriesMetadata(tile.timeseries || []);
  const historicalTimeseriesMetadata = useTimeseriesMetadata(
    full && tile.historicalTimeseries ? tile.historicalTimeseries : []);

  const rasterEvents = useRasterEvents((tile.rasterIntersections || []), start, end);
  const timeseriesEvents = useTimeseriesEvents(tile.timeseries || [], start, end);
  const historicalTimeseriesEvents = useTimeseriesEvents(
    full && tile.historicalTimeseries ? tile.historicalTimeseries : [], start, end);
  const rasterAlarmsResponse = useRasterAlarms();

  if (![rasterMetadata, timeseriesMetadata, historicalTimeseriesMetadata,
        rasterEvents, timeseriesEvents, historicalTimeseriesEvents].every(
    response => response.success) || rasterAlarmsResponse.status !== 'success') {
    return null; // XXX Spinner
  }

  // Find the raster alarms that are on the same point as one of the raster
  // intersections.
  const rasterAlarms = (full && tile.rasterIntersections ? (
    rasterAlarmsResponse.data!.results.map(alarm => {
      const intersection = tile.rasterIntersections!.find(
        rasterIntersection => isSamePoint(rasterIntersection.geometry, alarm.geometry)
      );
      if (!intersection) return null;

      const raster = rasterMetadata.data.find(
        raster => raster.uuid === intersection.uuid
      );

      if (!raster) return null;

      return {
        observationType: raster.observation_type,
        alarm
      };
    })) : []).filter(r => r !== null) as RasterObsType[];

  // Note: always concat timeseries first, then rasters, as config items like
  // tile.colors and tile.legendStrings depend on that.
  const events = (timeseriesEvents.data!).concat(rasterEvents.data!).concat(historicalTimeseriesEvents.data!);

  const tsObservationTypes = timeseriesMetadata.data!.map(ts => {
    return {
      observationType: ts.observation_type,
      historical: false
    };
  });
  const historicalTsObservationTypes = historicalTimeseriesMetadata.data!.map(ts => {
    return {
      observationType: ts.observation_type,
      historical: true
    };
  });
  const numHistoricalTimeseries = historicalTsObservationTypes.length;

  const rasterObservationTypes = rasterMetadata.data!.map(raster => {
    return {
      observationType: raster.observation_type,
      historical: false
    };
  });
  const observationTypes = tsObservationTypes.concat(rasterObservationTypes).concat(historicalTsObservationTypes);

  const axes = _getAxes(observationTypes);

  const layout = _getLayout(
    now,
    start,
    end,
    full,
    true,
    true,
    rect.width,
    rect.height,
    axes,
    tile.thresholds || [],
    tile.timelines || [],
    rasterAlarms,
    tile.backgroundColorShapes || []
  );

  const data = _getData(
    events,
    observationTypes,
    numHistoricalTimeseries,
    axes,
    tile.colors || null,
    tile.legendStrings || null,
    full);

  return (
    <Plot
      className="fullPlot"
      data={data}
      layout={layout}
      config={{displayModeBar: full}}
    />
  );
}

export default TimeseriesTile;
