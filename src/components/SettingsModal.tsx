import { useState, useContext } from 'react';
import { ConfigContext } from '../providers/ConfigProvider';
import { TimeContext } from '../providers/TimeProvider';
import { TrainingDashboard } from '../types/config';
import DateTimeInput from './DateTimeInput';
import Modal from './Modal';

interface SettingsModalProps {
  closeFunction: () => void;
  trainingDashboards: TrainingDashboard[];
}

function SettingsModal(props: SettingsModalProps) {
  const { closeFunction, trainingDashboards } = props;

  const [dashboardUrl, setDashboardUrl] = useState<string>(
    trainingDashboards && trainingDashboards[0] ?
    trainingDashboards[0].url : ""
  );

  const {
    isTraining,
    setCurrentConfigSlug,
    resetConfigSlug
  } = useContext(ConfigContext);
  const {
    now,
    isDateEdited,
    setEditedNow,
    resetEditedNow
  } = useContext(TimeContext);

  const confirmTrainingDashboard = () => {
    if (!dashboardUrl) {
      resetConfigSlug();
    } else {
      setCurrentConfigSlug(dashboardUrl);
    }
  }

  return (
    <Modal close={closeFunction} title="Settings">
      {!isDateEdited ? (
        <>
          <p><strong>Historical data</strong></p>
          <p>Currently showing local time. Select a new date and time to view historical data:</p>
          <DateTimeInput setConfirmedDate={setEditedNow!} />
          <p><strong>Training mode</strong></p>
          <p>Select a training scenario:</p>
          <select
            name="selectscenario"
            value={dashboardUrl}
            onChange={(event) => setDashboardUrl(event.target.value)}
          >
            {isTraining ? (
            <option value="">Return to live dashboard</option>
            ) : null}
            {trainingDashboards.map(({url, name}) => (
              <option value={url}>{name}</option>
            ))}
          </select>
          <input type="button" value="Choose" onClick={confirmTrainingDashboard} />
        </>
      ) : (
        <>
          <p><strong>Historical data</strong></p>
          <p>Time set to {now.toLocaleString()}.
            <input type="button" value="Cancel" onClick={resetEditedNow} />
          </p>
        </>
      )}
    </Modal>
  );
}

export default SettingsModal;
