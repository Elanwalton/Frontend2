"use client";
import React from 'react';
import styles from '../static-pages.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>Last Updated: January 17, 2026</p>
        </div>

        <div className={styles.card}>
          <div className={styles.content}>
            <p>
              At Sunleaf Technology Solutions (Kenya), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our website or use our services within the Republic of Kenya.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account, make a purchase, or subscribe to our newsletter. This may include your name, email address, phone number (M-Pesa registered), and Kenyan shipping address.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use your information to process orders, provide customer support in Kenya, and send you updates about our products and services. We do not sell your personal data to third parties.
            </p>

            <h2>3. Data Storage in Kenya</h2>
            <p>
              Your data is stored securely in accordance with the Data Protection Act of Kenya. We implement industry-standard security measures to prevent unauthorized access or disclosure.
            </p>

            <h2>4. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience and analyze site traffic within Kenya. You can manage your cookie preferences in your browser settings.
            </p>

            <div className={styles.borderTop}>
              <h2>5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact our Nairobi office at <strong>privacy@sunleafenergy.com</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
