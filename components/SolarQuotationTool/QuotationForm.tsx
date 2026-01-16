'use client';

import { useState } from 'react';
import styles from './QuotationForm.module.css';
import type { AnalysisResult } from './types';
import { analyzeAppliancesAi } from '@/lib/solarQuoteApi';

interface QuotationFormProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export default function QuotationForm({ onAnalysisComplete }: QuotationFormProps) {
  const [appliances, setAppliances] = useState('');
  const [backupDays, setBackupDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!appliances.trim()) {
      setError('Please enter your appliances');
      return;
    }

    setLoading(true);

    try {
      const result = await analyzeAppliancesAi({
        appliances,
        backupDays,
      });

      onAnalysisComplete(result);
    } catch (err: any) {
      setError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h2>Get Your Custom Solar Quote</h2>
        <p>Tell us about your appliances and we&apos;ll recommend a solar system and quotation.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="appliances">List your appliances</label>
        <textarea
          id="appliances"
          value={appliances}
          onChange={(e) => setAppliances(e.target.value)}
          placeholder="e.g., 2 refrigerators, 3 TVs, laptop, 10 LED lights, washing machine, microwave..."
          rows={4}
          disabled={loading}
          className={styles.textarea}
        />
        <small className={styles.hint}>Type naturally - AI will interpret conservative estimates.</small>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.formGroup}>
          <label htmlFor="backup-days">Battery Backup: {backupDays} {backupDays === 1 ? 'day' : 'days'}</label>
          <input
            type="range"
            id="backup-days"
            min="1"
            max="3"
            value={backupDays}
            onChange={(e) => setBackupDays(parseInt(e.target.value, 10))}
            disabled={loading}
            className={styles.range}
          />
          <div className={styles.rangeLabels}>
            <span>1 day</span>
            <span>2 days</span>
            <span>3 days</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Battery Type</label>
          <input
            type="text"
            value="Lithium"
            disabled
            className={styles.input}
          />
          <small className={styles.hint}>This quotation prioritizes lithium batteries.</small>
        </div>
      </div>

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className={styles.spinner} />
            Analyzing...
          </>
        ) : (
          'Analyze My Needs'
        )}
      </button>
    </form>
  );
}
