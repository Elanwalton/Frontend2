'use client';

import { useState } from 'react';
import QuotationForm from '@/components/SolarQuotationTool/QuotationForm';
import type { QuoteRequestData } from '@/components/SolarQuotationTool/types';
import styles from '@/styles/SolarQuote.module.css';

export default function SolarQuotePage() {
  const [submitted, setSubmitted] = useState(false);
  const [requestData, setRequestData] = useState<QuoteRequestData | null>(null);

  const handleSubmitSuccess = (data: QuoteRequestData) => {
    setRequestData(data);
    setSubmitted(true);
  };

  const handleStartOver = () => {
    setSubmitted(false);
    setRequestData(null);
  };

  if (submitted && requestData) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>Quote Request Submitted Successfully!</h2>
          
          <div className={styles.requestInfo}>
            <p><strong>Request Number:</strong> {requestData.request_number}</p>
            <p><strong>Status:</strong> <span className={styles.statusBadge}>{requestData.status}</span></p>
          </div>

          <div className={styles.messageBox}>
            <p>{requestData.message}</p>
            
            {requestData.ai_enabled && requestData.ai_quote_generated && (
              <div className={styles.aiNotice}>
                <p><strong>🤖 AI-Generated Quote:</strong></p>
                <p>Our AI has created a preliminary quote (#{requestData.ai_quote_id}) based on your requirements. Our team will review and refine it before sending to you.</p>
              </div>
            )}
          </div>

          <div className={styles.nextSteps}>
            <h3>What Happens Next?</h3>
            <ol>
              <li>Our team will review your request and the AI-generated quote</li>
              <li>We&apos;ll make any necessary adjustments to ensure accuracy</li>
              <li>You&apos;ll receive the final quote via email within 24 hours</li>
              <li>Our team will be available to answer any questions</li>
            </ol>
          </div>

          <div className={styles.actions}>
            <button onClick={handleStartOver} className={styles.secondaryButton}>
              Submit Another Request
            </button>
          </div>

          <div className={styles.contactInfo}>
            <p>Need immediate assistance? Contact us:</p>
            <p>📧 novagrouke@gmail.com | 📱 +254 712 616546</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <QuotationForm onSubmitSuccess={handleSubmitSuccess} />
    </div>
  );
}
