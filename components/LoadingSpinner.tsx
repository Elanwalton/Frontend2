// src/components/LoadingSpinner.tsx
"use client";

import React from 'react';
import { Zap } from 'lucide-react';
import styles from '@/styles/EnergyWaveLoader.module.css';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading... please wait',
  fullScreen = false,
}) => {
  const Wrapper = fullScreen ? 'div' : React.Fragment;

  return (
    <Wrapper
      {...(fullScreen
        ? {
            className: styles.container,
          }
        : {})}
    >
      <div className={`${fullScreen ? '' : styles.inline}`}>
        <div className={styles.loader}>
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.ring} />
          <div className={styles.iconWrapper}>
            <Zap size={32} strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className={styles.message}>{message}</p>
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default LoadingSpinner;