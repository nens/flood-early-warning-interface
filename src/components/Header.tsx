import { useState, useContext } from "react";
import LastUpdate from "./LastUpdate";
import LogoutButton from "./LogoutButton";
import InfoModal from "./InfoModal";
import SettingsModal from "./SettingsModal";
import SettingsButton from "./SettingsButton";

import styles from "./Header.module.css";
import { ConfigContext } from "../providers/ConfigProvider";
import packageJson from "../../package.json";

const INFO_MODAL = "info_modal";
const SETTINGS_MODAL = "settings_modal";

type ModalType = typeof INFO_MODAL | typeof SETTINGS_MODAL | null;

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  const [showingModal, setShowingModal] = useState<ModalType>(null);
  const configContext = useContext(ConfigContext);
  const { config, isTraining } = configContext;

  if (config == null) return null;

  const dashboards = config.trainingDashboards;

  return (
    <div className={styles.Header}>
      <div
        className={styles.Title}
        style={{ color: isTraining ? "red" : undefined }}
        title={`${title}${isTraining ? " TRAINING MODE" : ""}, ${
          "client-version: " + packageJson.version
        }`}
      >
        {title}
        {config.infoText ? (
          <span className={styles.InformationIcon} onClick={() => setShowingModal(INFO_MODAL)}>
            &#9432;
          </span>
        ) : null}
      </div>
      <div className={styles.RightBlock}>
        <LastUpdate />
        {dashboards.length > 0 ? (
          <SettingsButton onClick={() => setShowingModal(SETTINGS_MODAL)} />
        ) : null}
        <LogoutButton />
      </div>
      {showingModal === INFO_MODAL && <InfoModal closeFunction={() => setShowingModal(null)} />}
      {showingModal === SETTINGS_MODAL && (
        <SettingsModal
          closeFunction={() => setShowingModal(null)}
          trainingDashboards={dashboards}
        />
      )}
    </div>
  );
}

export default Header;
