import React, { useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { FeatureCollection, Feature, Point } from 'geojson';
import { RasterAlarm } from '../types/api';
import { DamProperties } from '../types/config';
import { BoundingBox, pointInPolygon } from '../util/bounds';
import { getMapBackgrounds } from '../constants';
import { useConfigContext } from '../providers/ConfigProvider';
import { useRectContext } from '../providers/RectProvider';


interface MapProps {
  dams: FeatureCollection<Point, DamProperties>;
  hoverDam: string | null,
  setHoverDam: (uuid: string | null) => void
}

/* function findAlarmForFeature(alarms: RasterAlarm[], feature: Feature | undefined) {
 *   if (!feature || feature.geometry.type !== 'Polygon') {
 *     return null;
 *   }
 *
 *   return alarms.find(
 *     alarm => pointInPolygon(alarm.geometry, feature.geometry as any as Polygon)
 *   );
 * } */

function AlarmsMap({ dams, hoverDam, setHoverDam }: MapProps) {
  const config = useConfigContext();
  const rect = useRectContext();

  /* const getFeatureStyle = useCallback(
   *   (feature: Feature | undefined) => {
   *     if (feature === undefined || feature === null) return {};

   *     const alarm = findAlarmForFeature(alarms, feature);
   *     const highlight = feature.id === hoverDam;

   *     if (alarm) {
   *       const warning_level = alarm.latest_trigger.warning_level;
   *       if (warning_level && ['Minor', 'Moderate', 'Major'].indexOf(warning_level) !== -1) {
   *         return {
   *           color: `var(--trigger-${warning_level.toLowerCase()})`,
   *           fillOpacity: highlight ? 0.7 : 0.5,
   *           opacity: highlight ? 1 : 0.5
   *         }
   *       }
   *     }

   *     return {
   *       color: "grey",
   *       fillOpacity: highlight ? 0.7 : 0.5,
   *       opacity: highlight ? 1 : 0.5
   *     };
   *   }, [alarms, hoverDam]);
   */
  const setHoverEffects = useCallback(
    (feature: Feature<Point>, layer) => {
      layer.on({
        mouseover: () => setHoverDam(feature ? (feature.name) : null),
        mouseout: () => setHoverDam(null)
      });
    }, [setHoverDam]);

  const bounds = new BoundingBox(...config.bounding_box);
  const mapBackgrounds = getMapBackgrounds(config.mapbox_access_token);

  if (!rect.width || !rect.height) return null; // Too early

  return (
    <MapContainer
      key={`${rect.width}x${rect.height}`}
      bounds={bounds.toLeafletBounds()}
      style={{height: rect.height, width: rect.width}}
    >
      <TileLayer url={mapBackgrounds[1].url} />
      <GeoJSON
        // Key is a trick to let layer redraw when hoverDam changes
        key={"warning_areas" + dams.features.length + hoverDam}
        data={dams}
//        style={getFeatureStyle}
        onEachFeature={setHoverEffects}
      />
    </MapContainer>
  );
}

export default AlarmsMap;
