'use client';

import styles from './AnalysisDisplay.module.css';
import type { AnalysisResult } from './types';

interface AnalysisDisplayProps {
  data: AnalysisResult;
  onGenerateQuotation: () => void;
  onStartOver: () => void;
}

export default function AnalysisDisplay({ data, onGenerateQuotation, onStartOver }: AnalysisDisplayProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>System Analysis Results</h2>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Peak Load</span>
            <span className={styles.cardValue}>{(data.summary.peakLoadWatts / 1000).toFixed(1)} kW</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardContent}>
            <span className={styles.cardLabel}>Daily Usage</span>
            <span className={styles.cardValue}>{data.summary.dailyKWh.toFixed(1)} kWh</span>
          </div>
        </div>

      </div>

      <div className={styles.recommendation}>
        <h3>Recommended System</h3>
        <div className={styles.recGrid}>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Solar PV</span>
            <span className={styles.recValue}>{data.summary.recommendedSolarKW} kW</span>
          </div>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Lithium Battery Storage</span>
            <span className={styles.recValue}>{data.summary.recommendedBatteryKWh} kWh</span>
          </div>
          <div className={styles.recItem}>
            <span className={styles.recLabel}>Inverter</span>
            <span className={styles.recValue}>{data.summary.recommendedInverterKW} kW</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onGenerateQuotation}>Generate Quotation</button>
        <button className={styles.secondary} onClick={onStartOver}>Start Over</button>
      </div>

      <div className={styles.disclaimer}>
        <strong>Disclaimer:</strong> This is a preliminary recommendation. Final sizing requires installer verification.
      </div>
    </div>
  );
}
