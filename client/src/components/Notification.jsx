import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

import styles from './styles/Notification.module.css';

const Notification = ({ message, onClose, duration = 10000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return createPortal(
    <div className={styles.notification}>
      <span>{message}</span>

      <button
        type="button"
        className={styles.closeBtn}
        onClick={onClose}
        aria-label="Close notification"
      >
        <FaTimes />
      </button>
    </div>,
    document.body,
  );
};

export default Notification;
