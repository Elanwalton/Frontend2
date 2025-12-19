"use client";
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import styles from '../../styles/PageLoadingSpinner.module.css';

interface PageLoadingSpinnerProps {
  isLoading?: boolean;
  message?: string;
}

export default function PageLoadingSpinner({ isLoading = true, message }: PageLoadingSpinnerProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Simulate page loading
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Complete progress when loading is done
  useEffect(() => {
    if (!isLoading && progress < 100) {
      setProgress(100);
    }
  }, [isLoading, progress]);

  if (!isLoading && progress === 100) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Main Loading Display */}
        <div className={styles.card}>
          {/* Battery Spinner */}
          <div className={styles.batteryContainer}>
            {/* Battery outline */}
            <div className={styles.batteryOutline}>
              {/* Battery terminal */}
              <div className={styles.batteryTerminal} />
              {/* Charging animation */}
              <div className={styles.batteryFillContainer}>
                <div 
                  className={styles.batteryFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {/* Lightning bolt */}
            <div className={styles.lightningContainer}>
              <Zap className={styles.lightning} size={32} />
            </div>
          </div>

          {/* Loading Text */}
          <div className={styles.textContainer}>
            <h3 className={styles.title}>
              Loading
              <span className={styles.dots}>
                <span className={styles.dot1}>.</span>
                <span className={styles.dot2}>.</span>
                <span className={styles.dot3}>.</span>
              </span>
            </h3>
            
            {/* Progress Bar */}
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Percentage */}
            <p className={styles.percentage}>{progress}%</p>
          </div>
        </div>

        {/* Loading Message */}
        {message ? (
          <p className={styles.message}>{message}</p>
        ) : (
          <p className={styles.message}>
            {progress < 30 && "Initializing solar data..."}
            {progress >= 30 && progress < 60 && "Loading battery information..."}
            {progress >= 60 && progress < 90 && "Preparing your dashboard..."}
            {progress >= 90 && "Almost ready..."}
          </p>
        )}
      </div>
    </div>
  );
}
