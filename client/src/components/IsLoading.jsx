import styles from './styles/IsLoading.module.css';

function IsLoading({ message = 'Loading...' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.spinner}></div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default IsLoading;
