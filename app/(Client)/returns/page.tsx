"use client";
import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../static-pages.module.css';

export default function ReturnsPage() {
  const steps = [
    { text: "Initiate return through your account or contact our Nairobi support.", icon: <CheckCircle2 size={20} /> },
    { text: "Pack the items securely in their original packaging.", icon: <CheckCircle2 size={20} /> },
    { text: "Affix the return label provided by our team.", icon: <CheckCircle2 size={20} /> },
    { text: "Our courier will pick up the package within 48 hours within Kenya.", icon: <CheckCircle2 size={20} /> }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Returns & Exchanges</h1>
          <p className={styles.subtitle}>
            Simple and transparent returns for our Kenyan customers.
          </p>
        </div>

        <div className={`${styles.card} ${styles.cardOrange}`} style={{ marginBottom: '3rem' }}>
          <div className={`${styles.flexCenter} ${styles.textOrangeDark}`} style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <div className={`${styles.iconBox} ${styles.textOrangeLight} ${styles.textOrangeNormal}`} style={{ marginBottom: 0 }}>
              <RefreshCw size={28} />
            </div>
            <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>30-Day Money Back Guarantee</h2>
          </div>
          <p className={styles.textAmberDark} style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>
            We want you to be completely satisfied with your purchase. If a product doesn't meet your needs, you can return it within 30 days of delivery anywhere in Kenya, provided it's in its original condition.
          </p>
        </div>

        <div className={`${styles.grid} ${styles.grid2}`}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Return Process</h2>
            <div className={styles.flexCol}>
              {steps.map((item, i) => (
                <div key={i} className={styles.flexStart}>
                  <div className={styles.textGreenNormal}>{item.icon}</div>
                  <div className={styles.contentP}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.card} ${styles.cardRed}`}>
            <div className={`${styles.flexCenter} ${styles.textRedDark}`} style={{ justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <AlertCircle size={24} />
              <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem', marginBottom: 0 }}>Non-Returnable Items</h2>
            </div>
            <p className={styles.textRedDeep} style={{ marginBottom: '1rem' }}>
              The following items cannot be returned unless they arrive faulty:
            </p>
            <ul className={`${styles.listDisc} ${styles.textRedDeep}`}>
              <li>Installed solar panels or inverters</li>
              <li>Activated software or energy monitoring licenses</li>
              <li>Custom-cut solar cables</li>
              <li>Used mounting brackets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
