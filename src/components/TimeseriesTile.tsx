import React, { useContext } from 'react';
import Plot from "react-plotly.js";
import { PlotData, Shape, Layout } from 'plotly.js';

import {
  BackgroundColorShape,
  ChartTile,
  LegendStyle,
  Threshold,
  Timeline
} from '../types/tiles';
import { ObservationType, Events } from '../types/api';
import { RectResult } from '../util/hooks';
import { RectContext } from '../providers/RectProvider';
import { TimeContext } from '../providers/TimeProvider';
import {
  useRasterMetadata,
  useRasterEvents,
  useTimeseriesMetadata,
  useTimeseriesEvents
} from '../api/hooks';

interface Props {
  tile: ChartTile;
  full: boolean;
}

type Axes = [] | [ObservationType] | [ObservationType, ObservationType];


function _getAxes(observationTypes: ObservationType[]): Axes {
  const first: ObservationType = observationTypes[0];

  if (!first) return [];

  for (let i=1; i < observationTypes.length; i++) {
    if (first.url !== observationTypes[i].url) {
      return [first, observationTypes[i]];
    }
  }
  return [first];
}

function getYAxis(observationType: ObservationType, side: "left"|"right") {
  const isRatio = observationType.scale === "ratio";

  return {
    title: observationType.unit || observationType.reference_frame,
    type: "linear" as const,
    rangemode: isRatio ? "tozero" as const : "normal" as const,
    side: side,
    overlaying: side === 'right' ? "y" as const : undefined,
    ticks: "outside" as const,
    tick0: isRatio ? 0 : undefined,
    showgrid: side === 'left',
    zeroline: isRatio
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

     TODO: translate colors to Lizard colors?
   */

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
    }
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

function getAnnotationsAndShapes(
  axes: Axes,
  now: Date,
  thresholds: Threshold[],
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

  thresholdAnnotations = thresholds.map(th =>
    getThresholdAnnotation(
      th,
      (axes.length === 2 && axes[1].unit === th.unitReference) ? "y2" : "y"
    )
  );

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
    thresholdAnnotations.forEach(thAnnot => {
      annotations.push(thAnnot);
    });
  }

  return { annotations, shapes };
}


function _getData(
  eventsArray: Events[],
  observationTypes: ObservationType[],
  axes: Axes,
  colors: string[] | null,
  legendStrings: string[] | null,
  full: boolean,
) {
  return eventsArray.map((events, idx) => {
    const observationType = observationTypes[idx];
    const legendString = legendStrings !== null ? legendStrings[idx] : null;
    const color = _getColor(colors, idx);

    const plotlyEvents: Partial<PlotData> = {
      x: events.map(event => event.timestamp),
      y: events.map(event => event.value),
      name: _getLegend(observationType, legendString),
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
      // No longer be able to zoom on yaxis on isFull, but keep pointer
      // cursor when isFull is false.
      fixedrange: full,
      visible: showAxis
    };
  }
  if (axes.length >= 2) {
    layout.yaxis2 = {
      ...getYAxis(axes[1]!, "right"),
      // No longer be able to zoom on second yaxis on isFull, but keep
      // pointer cursor when isFull is false.
      fixedrange: full,
      visible: showAxis
    };
  }

  return layout;
}


function TimeseriesTile({tile, full}: Props) {
  const { now, start, end } = useContext(TimeContext);
  const { rect } = useContext(RectContext) as {rect: RectResult};

  const rasterMetadata = useRasterMetadata(
    (tile.rasterIntersections || []).map(intersection => intersection.uuid)
  );
  const timeseriesMetadata = useTimeseriesMetadata(tile.timeseries || []);

  const rasterEvents = useRasterEvents((tile.rasterIntersections || []), start, end);
  const timeseriesEvents = useTimeseriesEvents(tile.timeseries || [], start, end);

  if (![rasterMetadata, timeseriesMetadata, rasterEvents, timeseriesEvents].every(
    response => response.success)) {
    return null; // XXX Spinner
  }

  // Note: always concat timeseries first, then rasters, as config items like
  // tile.colors and tile.legendStrings depend on that.
  const events = (timeseriesEvents.data!).concat(rasterEvents.data!);
  const observationTypes = timeseriesMetadata.data!.map(ts => ts.observation_type).concat(
    (rasterMetadata.data!.map(raster => raster.observation_type)));

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
    tile.backgroundColorShapes || []
  );

  const data = _getData(
    events,
    observationTypes,
    axes,
    tile.colors || null,
    tile.legendStrings || null,
    full);

  return (
    <Plot
      className="fullPlot"
      data={data}
      layout={layout}
      config={{displayModeBar: true}}
    />
  );
}

export default TimeseriesTile;
