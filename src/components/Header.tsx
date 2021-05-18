import { useState, useContext } from 'react';
import LastUpdate from './LastUpdate';
import LogoutButton from './LogoutButton';
import InfoModal from './InfoModal';
import SettingsModal from './SettingsModal';
import SettingsButton from './SettingsButton';

import styles from './Header.module.css';
import { ConfigContext } from '../providers/ConfigProvider';

const INFO_MODAL = 'info_modal';
const SETTINGS_MODAL = 'settings_modal';

type ModalType = typeof INFO_MODAL | typeof SETTINGS_MODAL | null;

function Header() {
  const [showingModal, setShowingModal] = useState<ModalType>(null);
  const configContext = useContext(ConfigContext);
  const { config, isTraining } = configContext;

  const dashboards = config!.trainingDashboards || [];

  return (
    <div className={styles.Header}>
      <div className={styles.Title} style={{color: isTraining ? "red" : undefined}}
        title={`FloodSmart Parramatta Dashboard ${isTraining ? "TRAINING MODE" : ""}`}
      >
        FloodSmart Parramatta Dashboard
        <span
          className={styles.InformationIcon}
          onClick={() => setShowingModal(INFO_MODAL)}
        >&#9432;</span>
      </div>
      <div className={styles.RightBlock}>
        <LastUpdate/>
        {dashboards.length > 0 ? (
          <SettingsButton onClick={() => setShowingModal(SETTINGS_MODAL)} />
        ) : null}
        <LogoutButton/>
      </div>
      {showingModal === INFO_MODAL && <InfoModal closeFunction={() => setShowingModal(null)} />}
      {showingModal === SETTINGS_MODAL &&
       <SettingsModal closeFunction={() => setShowingModal(null)} trainingDashboards={dashboards} />
      }
    </div>
  );
}

export default Header;
