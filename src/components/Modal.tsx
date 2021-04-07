import { WithChildren } from '../types/util';

import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  close: () => void;
}

function Modal({title, close, children}: WithChildren<ModalProps>) {
  return (
    <div className={styles.ModalContainer}>
      <div className={styles.Modal}>
        <div className={styles.ModalTitle}>
          {title}
          <span className={styles.X} onClick={close} title="Close">&#128473;</span>
        </div>
        <div className={styles.ModalContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
