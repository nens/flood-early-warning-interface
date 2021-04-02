import { useContext } from 'react';

import { TimeContext } from '../providers/TimeProvider';

import styles from './CurrentTime.module.css';

function CurrentTime() {
  const { now } = useContext(TimeContext);

  return (
    <span className={styles.CurrentTime}>
      {now.getHours()}:{now.getMinutes()}
    </span>
  );
}

export default CurrentTime;
