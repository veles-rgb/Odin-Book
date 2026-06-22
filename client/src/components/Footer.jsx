import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <div className="footerContainer">
        <a
          href=" https://github.com/veles-rgb/Odin-Book"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <FaGithub />
            <div>&copy; 2026 veles-rgb</div>
          </div>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
