"use client";
import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import styles from '../static-pages.module.css';

const faqs = [
  {
    q: "How do I choose the right solar kit for my home in Kenya?",
    a: "Choosing the right solar kit depends on your average monthly energy consumption in Kenya (kWh), your roof space, and whether you want to be completely off-grid or hybrid. We recommend starting with our Solar Quote tool for a personalized recommendation based on Kenyan power conditions."
  },
  {
    q: "Do you offer professional installation services countrywide?",
    a: "Yes! We have a network of certified installers across all 47 counties in Kenya. You can select 'Professional Installation' during checkout, and our team will coordinate with you."
  },
  {
    q: "What is the warranty period for your products?",
    a: "Warranties vary by product: Solar panels typically have a 25-year performance warranty, inverters 5-10 years, and lithium batteries 5-10 years. All warranties are honored locally in Kenya."
  },
  {
    q: "How long does shipping take within Kenya?",
    a: "For Nairobi and surrounding areas, we deliver within 24-48 hours. Regional deliveries to other parts of Kenya take 3-5 business days."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, Local Credit/Debit Cards, Bank Transfers, and flexible financing options through our Kenyan banking partners."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className={styles.container}>
        <div className={styles.innerNarrow}>
          <div className={styles.header}>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
              Find quick answers to common questions about our products and services in Kenya.
            </p>
          </div>

          <div>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.accordion}>
                <div 
                  className={styles.accordionHeader}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  {faq.q}
                  <ChevronDown 
                    size={20} 
                    className={`${styles.accordionIcon} ${openIndex === index ? styles.iconRotated : ''}`}
                  />
                </div>
                {openIndex === index && (
                  <div className={styles.accordionContent}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={`${styles.card} ${styles.marginTop4} ${styles.textCenter} ${styles.cardBlue}`}>
            <div className={`${styles.iconBox} ${styles.iconBoxCenter}`}>
              <MessageCircle size={28} />
            </div>
            <h2 className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>Still have questions?</h2>
            <p className={styles.textSmallGray} style={{ marginBottom: '1.5rem' }}>We're here to help you build your perfect solar solution.</p>
            <div className={styles.primaryText}>Email: support@sunleafenergy.com</div>
          </div>
        </div>
      </div>
    </>
  );
}
