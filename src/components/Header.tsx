import styles from './Header.module.css';

function Header() {
  return (
    <div style={{height: 'var(--header-height)', width: '100%'}}>
      <span className={styles.Title}>
        FloodSmart Parramatta Dashboard
      </span>
    </div>
  );
}

export default Header;
