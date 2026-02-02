'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/styles/CookieConsent.module.css';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay for smooth animation
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 1000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div className={`${styles.banner} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.flexWrapper}>
            {/* Content */}
            <div className={styles.textSection}>
              {/* Cookie Icon */}
              <div className={styles.iconWrapper}>
                <svg
                  className={styles.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>

              {/* Text */}
              <div>
                <h3 className={styles.title}>
                  We Value Your Privacy
                </h3>
                <p className={styles.description}>
                  We use essential cookies to keep you logged in and ensure our website functions properly. 
                  These cookies are necessary for the site to work and cannot be disabled. 
                  By continuing to use this site, you agree to our use of essential cookies.{' '}
                  <Link 
                    href="/privacy-policy" 
                    className={styles.link}
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className={styles.buttonGroup}>
              <button
                onClick={declineCookies}
                className={`${styles.button} ${styles.buttonDecline}`}
              >
                Decline
              </button>
              <button
                onClick={acceptCookies}
                className={`${styles.button} ${styles.buttonAccept}`}
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

