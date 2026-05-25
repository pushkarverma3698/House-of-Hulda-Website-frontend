import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <h2 className={styles.logo}>House of Hulda</h2>
            <p className={styles.tagline}>A sanctuary above the clouds.</p>
          </div>
          
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Sitemap</h3>
            <ul className={styles.links}>
              <li><a href="#about">Our Story</a></li>
              <li><a href="#rooms">The Rooms</a></li>
              <li><a href="#experience">Naggar Experience</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Socials</h3>
            <ul className={styles.links}>
              <li><a href="https://instagram.com/houseofhulda" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://facebook.com/houseofhulda" target="_blank" rel="noopener noreferrer">Facebook</a></li>
              <li><a href="https://airbnb.com/rooms/houseofhulda" target="_blank" rel="noopener noreferrer">Airbnb</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} House of Hulda. All rights reserved.</p>
          <p className={styles.designer}>Designed inspired by Forma Haus</p>
        </div>
      </div>
    </footer>
  );
}
