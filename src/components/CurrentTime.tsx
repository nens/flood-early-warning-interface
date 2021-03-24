import React, { useContext } from 'react';

import styles from './CurrentTime.module.css';
import { TimeContext } from '../providers/TimeProvider';

function CurrentTime() {
  const { now } = useContext(TimeContext);

  return (
    <span className={styles.CurrentTime}>
      {now.getHours()}:{now.getMinutes()}
    </span>
  );
}

export default CurrentTime;
