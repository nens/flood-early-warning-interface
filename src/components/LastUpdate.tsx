import { useContext } from 'react';
import { useConfigContext } from '../providers/ConfigProvider';
import { TimeContext } from '../providers/TimeProvider';
import { useRasterMetadata } from '../api/hooks';

import styles from './Header.module.css';

function _toTimeStr(d: Date) {
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function LastUpdate() {
  const { rasters } = useConfigContext();
  const { now } = useContext(TimeContext);
  const rasterResponse = useRasterMetadata([rasters.operationalModelDepth]);

  let lastModelRun = '-';
  if (rasterResponse.success && rasterResponse.data.length > 0) {
    const raster = rasterResponse.data[0];
    const lastModified = new Date(raster.last_modified)
    lastModelRun = _toTimeStr(lastModified);
  }

  return (
    <ul className={styles.LastModelRun}>
      <li>last model run {lastModelRun}</li>
      <li>current dashboard time {_toTimeStr(now)}</li>
    </ul>
  );
}

export default LastUpdate;
