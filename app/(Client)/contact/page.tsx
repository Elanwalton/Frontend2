"use client";
import React from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import styles from '../static-pages.module.css';

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setFeedbackMsg('');

    try {
      const endpoint = process.env.NEXT_PUBLIC_API_URL + '/contact.php';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setFeedbackMsg(data.message);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
        setFeedbackMsg(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');
      setFeedbackMsg('Network error. Please try again later.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Have questions about our solar solutions? Our team of energy experts in Nairobi is here to help.
          </p>
        </div>

        <div className={`${styles.grid} ${styles.grid2}`}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Get in Touch</h2>
            
            <div className={styles.contactItem}>
              <div className={styles.iconBox}><Mail size={24} /></div>
              <div>
                <div className={styles.contactLabel}>Email us at</div>
                <div className={styles.contactValue}>hello@sunleafenergy.com</div>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={`${styles.iconBox} ${styles.iconGreen}`}><Phone size={24} /></div>
              <div>
                <div className={styles.contactLabel}>Call us at</div>
                <div className={styles.contactValue}>+254 700 000 000</div>
              </div>
            </div>

            <div className={styles.contactItem}>
              <div className={`${styles.iconBox} ${styles.iconAmber}`}><MapPin size={24} /></div>
              <div>
                <div className={styles.contactLabel}>Visit us at</div>
                <div className={styles.contactValue}>Nairobi, Kenya</div>
              </div>
            </div>

            <div className={styles.supportBox}>
              <div className={styles.supportTitle}>
                <Clock size={18} /> Support Hours
              </div>
              <p className={styles.supportText}>
                Monday - Friday: 8:00 AM - 6:00 PM<br />
                Saturday: 9:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>

          <div className={styles.card}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={`${styles.grid} ${styles.grid2}`} style={{ marginTop: 0 }}>
                <div className={styles.inputGroup}>
                   <label className={styles.inputLabel}>First Name</label>
                   <input 
                     className={styles.input} 
                     type="text" 
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleChange}
                     required 
                   />
                </div>
                <div className={styles.inputGroup}>
                   <label className={styles.inputLabel}>Last Name</label>
                   <input 
                     className={styles.input} 
                     type="text" 
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleChange}
                     required 
                   />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email Address</label>
                <input 
                  className={styles.input} 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number</label>
                <input 
                  className={styles.input} 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>How can we help?</label>
                <textarea 
                  className={styles.input} 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              {status === 'success' && (
                <div className={styles.successMessage} style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0' }}>
                  {feedbackMsg}
                </div>
              )}
              {status === 'error' && (
                <div className={styles.errorMessage} style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                  {feedbackMsg}
                </div>
              )}

              <button className={styles.submitBtn} type="submit" disabled={status === 'loading'}>
                <div className={styles.flexCenter}>
                  {status === 'loading' ? (
                     <span>Sending...</span>
                  ) : (
                     <><Send size={18} /> Send Message</>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
