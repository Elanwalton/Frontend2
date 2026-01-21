"use client";
import { useState } from 'react';
import styles from '@/styles/Footer.module.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiEndpoint } from '@/utils/apiClient';

import Link from 'next/link';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Please enter a valid email address');
      return;
    }

    setSubscriptionStatus('loading');
    
    try {
      const response = await fetch(getApiEndpoint('/subscribe'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubscriptionStatus('success');
        setSubscriptionMessage('Successfully subscribed! Check your email.');
        setEmail('');
        setTimeout(() => setSubscriptionStatus('idle'), 5000);
      } else {
        setSubscriptionStatus('error');
        setSubscriptionMessage(data.message || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.ctaSectionWrapper}>
        <div className={styles.ctaSection}>
          <div className={styles.ctaIcon}>
            <Mail size={48} />
          </div>
          <div className={styles.ctaText}>
            <h2>Stay Updated on Green Tech</h2>
            <p>Be first to receive news, exclusive deals, and the latest innovations in sustainable power solutions.</p>
            <form className={styles.ctaForm} onSubmit={handleSubscribe}>
              <div className={styles.inputWrapper}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscriptionStatus === 'loading'}
                />
                <button 
                  type="submit"
                  disabled={subscriptionStatus === 'loading'}
                  className={subscriptionStatus === 'success' ? styles.successBtn : ''}
                >
                  {subscriptionStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {subscriptionStatus === 'success' && (
                <div className={styles.successMessage}>
                  <CheckCircle size={18} />
                  <span>{subscriptionMessage}</span>
                </div>
              )}
              {subscriptionStatus === 'error' && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={18} />
                  <span>{subscriptionMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className={styles.linksContainer}>
        <div className={styles.linkColumn}>
          <h4>Support</h4>
          <ul>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/shipping">Shipping Info</Link></li>
            <li><Link href="/returns">Returns & Exchanges</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div className={styles.linkColumn}>
          <h4>Solutions</h4>
          <ul>
            <li><Link href="/product/solis-5-0kw-off-grid-single-phase-inverter-low-voltage">Inverters</Link></li>
            <li><Link href="/product/mercer-2-4kwh-lithium-battery">Battery Systems</Link></li>
            <li><Link href="/product/ph-1-10kw-off-grid-single-phase-inverter-with-built-in-sol">Solar Kits</Link></li>
            <li><Link href="/product/sunleaf-energy-power-meter-3-phase">Energy Meters</Link></li>
          </ul>
        </div>
        <div className={styles.linkColumn}>
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Location</Link></li>
          </ul>
        </div>
        <div className={styles.linkColumn}>
          <h4>Connect</h4>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.bottomNote}>
          &copy; {new Date().getFullYear()} Sunleaf Technology Solutions. Empowering Tomorrow. All rights reserved.
        </div>
        <div className={styles.legalLinks}>
          <Link href="/privacy">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
