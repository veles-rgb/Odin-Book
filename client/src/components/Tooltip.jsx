import styles from './styles/Tooltip.module.css';

const Tooltip = ({ content, children }) => {
  return (
    <div className={styles.wrapper}>
      {children}

      <div className={styles.tooltip}>{content}</div>
    </div>
  );
};

export default Tooltip;
