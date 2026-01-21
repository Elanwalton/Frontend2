"use client";
import React, { useState } from 'react';
import { 
  Truck, Package, MapPin, Clock, Shield, CheckCircle, 
  AlertTriangle, Phone, Mail, Search, Zap, Box, 
  Map, Globe, Home, ArrowRight, Info
} from 'lucide-react';
import Link from 'next/link';
import styles from './shipping.module.css';

const ShippingPage = () => {
  const [selectedCounty, setSelectedCounty] = useState('');

  const deliveryOptions = [
    {
      icon: Home,
      title: 'Local Delivery',
      subtitle: 'Nairobi & Environs',
      time: '24-48 Hours',
      description: 'Fast delivery within Nairobi and surrounding areas including Kiambu, Machakos, and Kajiado counties.',
      styleClass: styles.gradientOrange,
      features: ['Free delivery over KES 50,000', 'Same-day available', 'Real-time tracking']
    },
    {
      icon: Map,
      title: 'Countrywide Shipping',
      subtitle: 'All 47 Counties',
      time: '3-5 Days',
      description: 'Reliable delivery to all counties across Kenya from Mombasa to Turkana, ensuring nationwide coverage.',
      styleClass: styles.gradientBlue,
      features: ['Affordable rates', 'Secure packaging', 'SMS notifications']
    },
    {
      icon: Zap,
      title: 'Express Options',
      subtitle: 'Priority Delivery',
      time: 'Same Day',
      description: 'Same day delivery available for selected solar kits and accessories within Nairobi CBD and suburbs.',
      styleClass: styles.gradientPurple,
      features: ['Premium service', 'Before 5 PM delivery', 'Direct contact']
    },
    {
      icon: Box,
      title: 'Safe Handling',
      subtitle: 'Specialized Care',
      time: 'Every Order',
      description: 'Special packaging for fragile solar panels and secure handling for high-capacity lithium batteries.',
      styleClass: styles.gradientGreen,
      features: ['Protective packaging', 'Trained handlers', 'Insurance included']
    }
  ];

  const shippingProcess = [
    { step: 1, title: 'Order Placed', description: 'Your order is received and verified in our system', icon: CheckCircle },
    { step: 2, title: 'Processing', description: 'Items are carefully picked and packaged at our Nairobi warehouse', icon: Package },
    { step: 3, title: 'Dispatched', description: 'Order shipped with tracking number sent via SMS and email', icon: Truck },
    { step: 4, title: 'Delivered', description: 'Safe delivery to your doorstep with signature confirmation', icon: Home }
  ];

  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado',
    'Meru', 'Nyeri', 'Eldoret', 'Thika', 'Kakamega', 'Kitale', 'Garissa'
  ];

  const faqs = [
    {
      question: 'Do you deliver to my location?',
      answer: 'Yes! We deliver to all 47 counties in Kenya. Delivery times vary based on your location, with Nairobi and environs receiving orders within 24-48 hours, while upcountry deliveries take 3-5 days.'
    },
    {
      question: 'How much does shipping cost?',
      answer: 'Shipping costs are calculated at checkout based on weight and destination. We offer free delivery for orders over KES 50,000 within Nairobi. Upcountry rates start from KES 500 for small items.'
    },
    {
      question: 'What if my item arrives damaged?',
      answer: 'Please inspect your delivery upon arrival. Note any visible damage on the delivery receipt and contact our support team immediately at 0712 345 678. We provide quick replacements for transit-damaged items.'
    },
    {
      question: 'Do you offer same-day delivery?',
      answer: 'Yes, same-day delivery is available for selected products within Nairobi CBD and suburbs. Orders must be placed before 12 PM. Express delivery charges apply.'
    },
    {
      question: 'Is installation included with delivery?',
      answer: 'Delivery and installation are separate services. However, we offer professional installation services across Kenya. Contact us to schedule installation after delivery.'
    }
  ];

  return (
    <div className={styles.shippingWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <Truck size={48} />
            <h1>Shipping Information</h1>
          </div>
          <p>Reliable and secure delivery of energy solutions across Kenya</p>
        </div>
      </section>

      {/* Delivery Options Grid */}
      <section className={styles.optionsSection}>
        <div className={styles.optionsInner}>
          <div className={styles.optionsGrid}>
            {deliveryOptions.map((option, idx) => (
              <div key={idx} className={styles.optionCard}>
                <div className={`${styles.cardTop} ${option.styleClass}`}>
                  <option.icon size={48} />
                  <h3>{option.title}</h3>
                  <p>{option.subtitle}</p>
                </div>
                
                <div className={styles.cardBottom}>
                  <div className={styles.timeInfo}>
                    <Clock size={20} className="text-blue-600" />
                    <span className={styles.timeText}>{option.time}</span>
                  </div>
                  
                  <p className={styles.desc}>{option.description}</p>
                  
                  <div className={styles.featureList}>
                    {option.features.map((feature, fIdx) => (
                      <div key={fIdx} className={styles.featureItem}>
                        <CheckCircle size={14} className="text-green-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Policy */}
      <section className={styles.policySection}>
        <div className={styles.policyInner}>
          <div className={styles.policyHeader}>
            <h2>Our Shipping Policy</h2>
            <p>
              At Sunleaf Technology Solutions, we understand the importance of receiving your energy equipment 
              safely and on time. We use specialized logistics partners within Kenya who are trained in handling 
              high-capacity lithium batteries and delicate solar panels.
            </p>
          </div>

          <div className={styles.policyList}>
            {/* Policy Section 1 */}
            <div className={styles.policyItem}>
              <div className={styles.policyFlex}>
                <div className={styles.policyIcon}>
                  <MapPin size={24} />
                </div>
                <div className={styles.policyContent}>
                  <h3>1. Delivery Fees & Coverage</h3>
                  <p>
                    We operate exclusively within the Republic of Kenya. Delivery fees are calculated at checkout 
                    based on the weight of the items and the destination county. We offer competitive rates for 
                    regional deliveries outside Nairobi.
                  </p>
                  <div className={styles.highlight}>
                    <strong>Free Delivery:</strong> Orders over KES 50,000 within Nairobi and surrounding counties
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Section 3 (Renumbered to 2 because tracking was removed) */}
            <div className={styles.policyItem}>
              <div className={styles.policyFlex}>
                <div className={`${styles.policyIcon} ${styles.alertIconBox}`}>
                  <AlertTriangle size={24} />
                </div>
                <div className={styles.policyContent}>
                  <h3>2. Damaged Shipments</h3>
                  <p>
                    Please inspect your delivery upon arrival. If there is visible damage to the packaging or products, 
                    please note it on the delivery receipt and contact our Kenyan support team immediately. We ensure 
                    quick replacements for items damaged during transit.
                  </p>
                  
                  <div className={styles.damageGrid}>
                    <div className={styles.damageBox}>
                      <h4>What to do:</h4>
                      <ul className={styles.damageList}>
                        <li className={styles.damageItem}><CheckCircle size={16} className={styles.textOrange} /> Inspect package before signing</li>
                        <li className={styles.damageItem}><CheckCircle size={16} className={styles.textOrange} /> Note damage on delivery receipt</li>
                        <li className={styles.damageItem}><CheckCircle size={16} className={styles.textOrange} /> Take photos of damaged items</li>
                        <li className={styles.damageItem}><CheckCircle size={16} className={styles.textOrange} /> Contact us within 24 hours</li>
                      </ul>
                    </div>
                    
                    <div className={styles.contactBoxSmall}>
                      <h4>Contact Support:</h4>
                      <div className={styles.contactInfoList}>
                        <div className={styles.contactInfoItem}>
                          <Phone size={16} className={styles.textBlue} />
                          <a href="tel:+254712345678">+254 712 345 678</a>
                        </div>
                        <div className={styles.contactInfoItem}>
                          <Mail size={16} className={styles.textBlue} />
                          <a href="mailto:hello@sunleafenergy.com">hello@sunleafenergy.com</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Process */}
      <section className={styles.processSection}>
        <div className={styles.processInner}>
          <div className={styles.processHeader}>
            <h2>How Shipping Works</h2>
            <p>From order to doorstep in 4 simple steps</p>
          </div>

          <div className={styles.processGrid}>
            {shippingProcess.map((process, idx) => (
              <div key={idx} className={styles.stepWrapper}>
                <div className={styles.stepIcon}>
                  <div className={styles.stepIconBg}>
                    <process.icon size={40} />
                  </div>
                  <div className={styles.stepNum}>{process.step}</div>
                </div>
                <h3>{process.title}</h3>
                <p>{process.description}</p>
                {idx < shippingProcess.length - 1 && <div className={styles.line}></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Section */}
      <section className={styles.mapSection}>
        <div className={styles.mapInner}>
          <div className={styles.processHeader}>
            <h2>Nationwide Coverage</h2>
            <p>We deliver to all 47 counties across Kenya</p>
          </div>

          <div className={styles.mapCard}>
            <div className={styles.mapCardHeader}>
              <Globe size={32} className="text-blue-600" />
              <h3>Select Your County</h3>
            </div>
            
            <div className={styles.countyGrid}>
              {counties.map((county, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCounty(county)}
                  className={`${styles.countyBtn} ${selectedCounty === county ? styles.activeCounty : ''}`}
                >
                  {county}
                </button>
              ))}
            </div>

            {selectedCounty && (
              <div className={styles.countyInfo}>
                <div className={styles.countyInfoFlex}>
                  <Info size={24} className="text-blue-600" />
                  <div className={styles.countyInfoText}>
                    <h4>Delivery to {selectedCounty}</h4>
                    <p>
                      {selectedCounty === 'Nairobi' ? 
                        'Free delivery for orders over KES 50,000. Standard delivery in 24-48 hours.' :
                        `Standard delivery in 3-5 days. Shipping costs calculated at checkout.`
                      }
                    </p>
                    <div className={styles.availableBadge}>
                      <CheckCircle size={16} />
                      Available for delivery
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.processHeader}>
            <h2>Shipping FAQs</h2>
            <p>Common questions about our delivery service</p>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, idx) => (
              <div key={idx} className={styles.faqItem}>
                <h3>
                  <span className={styles.qMark}>Q:</span>
                  <span>{faq.question}</span>
                </h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <Package size={64} className={styles.ctaIcon} />
          <h2>Ready to Order?</h2>
          <p>Get reliable delivery of premium solar equipment to your doorstep anywhere in Kenya</p>
          <div className={styles.btnGroup}>
            <Link href="/categories">
              <button className={styles.shopBtn}>
                Shop Now
                <ArrowRight size={20} />
              </button>
            </Link>
            <Link href="/contact">
              <button className={styles.contactBtn}>
                Contact Support
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShippingPage;
