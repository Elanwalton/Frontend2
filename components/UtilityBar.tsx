import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import styles from "../styles/UtilityBar.module.css";

const UtilityBar: React.FC = () => {
  return (
    <div className={styles.utilityBar}>
      {/* Left side */}
      <div className={styles.left}>
        <span className={styles.phone}>+25472222222</span>
        <span className={styles.email}>sunleaf@technologies.ac.ke</span>
      </div>

      {/* Center links */}
      <div className={styles.links}>
        <a href="/projects">Projects</a>
        <a href="/blog">Blog</a>
        <a href="/contact">Contact Us</a>
      </div>

      {/* Right social icons */}
      <div className={styles.socials}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedinIn />
        </a>
      </div>
    </div>
  );
};

export default UtilityBar;
