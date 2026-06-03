import { useState, useRef, useEffect } from 'react';
import styles from './styles/OptionsMenu.module.css';
import { HiDotsVertical } from 'react-icons/hi';

const OptionsMenu = ({ className = '', children }) => {
  const menuRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    setShowMenu((prev) => !prev);
  };

  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (e) => {
      if (showMenu && !menuRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showMenu]);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <button type="button" className={styles.trigger} onClick={handleClick}>
        <HiDotsVertical />
      </button>

      {showMenu && (
        <div ref={menuRef} className={styles.menu}>
          {children}
        </div>
      )}
    </div>
  );
};

export default OptionsMenu;
