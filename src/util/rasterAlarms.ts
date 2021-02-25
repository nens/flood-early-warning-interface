import { RasterAlarm } from '../types/api';


export function isGaugeAlarm(alarm: RasterAlarm): boolean {
  // Return true if 'minor' is in the thresholds, dam alarms
  // use other terms
  return alarm.thresholds && alarm.thresholds.some(
    ({warning_level}) => (warning_level.toLowerCase() === 'minor'));
}


export function thresholdsByWarningLevel(alarm: RasterAlarm): {[level: string]: number} {
  const result: {[level: string]: number} = {};

  if (alarm.thresholds) {
    for (const threshold of alarm.thresholds) {
      result[threshold.warning_level.toLowerCase()] = threshold.value;
    }
  }

  return result;
}
