import styles from './Header.module.css';

interface SettingsButtonProps {
  onClick: () => void;
}

function SettingsButton(props: SettingsButtonProps) {
  const { onClick } = props;

  return (
    <div className={styles.SettingsButton} onClick={onClick}>&#x2699;</div>
  );
}

export default SettingsButton;
