'use client';

import { useState } from 'react';
import QuotationForm from '@/components/SolarQuotationTool/QuotationForm';
import AnalysisDisplay from '@/components/SolarQuotationTool/AnalysisDisplay';
import QuotationResult from '@/components/SolarQuotationTool/QuotationResult';
import type { AnalysisResult, SolarQuoteResult } from '@/components/SolarQuotationTool/types';
import { generateSolarQuote } from '@/lib/solarQuoteApi';

export default function SolarQuotePage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [quote, setQuote] = useState<SolarQuoteResult | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setAnalysis(null);
    setQuote(null);
    setCustomerName('');
    setCustomerEmail('');
    setError('');
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!analysis) return;

    setError('');
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please enter your name and email to generate a quotation');
      return;
    }

    setLoading(true);
    try {
      const result = await generateSolarQuote({
        analysisData: analysis,
        customerName,
        customerEmail,
      });
      setQuote(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 1rem' }}>
      {!analysis && !quote && (
        <QuotationForm
          onAnalysisComplete={(res) => {
            setAnalysis(res);
            setQuote(null);
          }}
        />
      )}

      {analysis && !quote && (
        <>
          <AnalysisDisplay
            data={analysis}
            onGenerateQuotation={() => {}}
            onStartOver={reset}
          />

          <div
            style={{
              maxWidth: 900,
              margin: '1rem auto 0',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '0.75rem', color: '#111827' }}>
              Generate Your Quotation
            </h3>

            {error && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #f87171',
                  borderRadius: 8,
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  Name
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                  Email
                </label>
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: 8,
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                marginTop: '1rem',
                width: '100%',
                background: loading ? '#d1d5db' : '#10b981',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '1rem',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Generating...' : 'Generate Quotation'}
            </button>

            <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Prices and VAT are calculated on the server. This is a non-binding estimate.
            </div>
          </div>
        </>
      )}

      {quote && (
        <QuotationResult
          data={quote}
          onStartOver={reset}
        />
      )}
    </div>
  );
}
