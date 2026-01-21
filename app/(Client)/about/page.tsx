"use client";
import React, { useState, useEffect } from 'react';
import { 
  Sun, Award, Users, TrendingUp, Shield, Zap, Heart, Globe, 
  CheckCircle, Star, ArrowRight, MapPin, Phone, Mail, Leaf,
  Battery, Home, Building2, ChevronRight
} from 'lucide-react';
import styles from './about.module.css';

const AboutPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { label: 'Happy Customers', value: '5,000+', icon: Users },
    { label: 'Systems Installed', value: '7,500+', icon: Home },
    { label: 'CO₂ Saved (Tons)', value: '15,000+', icon: Leaf },
    { label: 'Counties Served', value: '47', icon: Globe }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Quality Guaranteed',
      description: 'We only partner with top-tier manufacturers like Solis, Dyness, and Jinko Solar to ensure every product meets our rigorous quality standards and certifications.',
      features: ['ISO Certified Products', '5-25 Year Warranties', 'Tested & Verified']
    },
    {
      icon: Zap,
      title: 'Energy Efficient',
      description: 'Our solutions are optimized for maximum power output and durability, even in the toughest conditions. Get more energy from every ray of sunlight.',
      features: ['97%+ Efficiency', 'Weather Resistant', 'Long-lasting Performance']
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Our dedicated support team is always here to help you navigate your energy transition. From consultation to after-sales support, we\'re with you every step.',
      features: ['24/7 Support', 'Free Consultations', 'Lifetime Assistance']
    },
    {
      icon: Award,
      title: 'Expert Installation',
      description: 'We provide comprehensive guides and professional installation services across Kenya. Our certified technicians ensure perfect setup every time.',
      features: ['Certified Installers', 'Full Documentation', 'Post-Install Support']
    }
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'Started with a vision to make solar energy accessible to everyone in Kenya' },
    { year: '2021', title: '1,000 Installations', description: 'Reached our first major milestone serving homes across Nairobi' },
    { year: '2022', title: 'Regional Expansion', description: 'Expanded operations to Mombasa, Kisumu, and Nakuru' },
    { year: '2023', title: '5,000+ Customers', description: 'Became Kenya\'s trusted solar solutions provider' },
    { year: '2024', title: 'Nationwide Network', description: 'Established service hubs in all major Kenyan towns' }
  ];

  const team = [
    { name: 'Angelou Wambura', role: 'Founder & CEO', specialty: '15 years in renewable energy' },
    { name: 'Sarah Ochieng', role: 'Technical Director', specialty: 'Solar system design expert' },
    { name: 'James Mwangi', role: 'Head of Operations', specialty: 'Project management specialist' },
    { name: 'Grace Wanjiru', role: 'Customer Success Lead', specialty: 'Client satisfaction advocate' }
  ];

  const certifications = [
    'ISO 9001:2015 Certified',
    'Authorized Solis Dealer',
    'KEBS Approved Supplier',
    'ERC Licensed Installer',
    'Green Energy Council Member'
  ];

  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroBlur1}></div>
        <div className={styles.heroBlur2}></div>
        
        <div className={`${styles.heroContent} ${isVisible ? styles.heroVisible : styles.heroHidden}`}>
          <div className={styles.heroBadge}>
            <Leaf size={16} />
            <span>Powering a Sustainable Future Since 2020</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            Redefining Sustainable Energy
          </h1>
          
          <p className={styles.heroSubtitle}>
            Sunleaf Technology Solutions is dedicated to empowering homes and businesses 
            with <strong>clean, reliable, and affordable</strong> power.
          </p>
          
          <div className={styles.buttonGroup}>
            <button className={styles.primaryBtn}>
              Get Started Today
              <ArrowRight size={20} />
            </button>
            <button className={styles.secondaryBtn}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statItem}>
              <div className={styles.statIconWrapper}>
                <stat.icon size={32} />
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className={styles.impactSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Mission & Vision</h2>
          <div className={styles.titleUnderline}></div>
        </div>

        <div className={styles.impactGrid}>
          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.iconBlue}`}>
              <TrendingUp size={32} />
            </div>
            <h3 className={styles.cardTitle}>Our Mission</h3>
            <p className={styles.cardDesc}>
              At Sunleaf, we believe that access to sustainable energy is a <strong>fundamental right</strong>. 
              Our mission is to accelerate the global transition to renewable power by providing cutting-edge technology and exceptional service.
            </p>
          </div>

          <div className={styles.card}>
            <div className={`${styles.cardIcon} ${styles.iconCyan}`}>
              <Globe size={32} />
            </div>
            <h3 className={styles.cardTitle}>Our Impact</h3>
            <p className={styles.cardDesc}>
              Founded in 2020, we've helped <strong>thousands of customers</strong> reduce 
              their carbon footprint and gain energy independence through our curated selection of solar kits, battery systems, and smart energy devices.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Sunleaf Section */}
      <section className={styles.valuesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Choose Sunleaf?</h2>
          <p className={`${styles.heroSubtitle} ${styles.marginTop1}`}>
            We're more than just a solar company. We're your partner in the journey to sustainable energy.
          </p>
        </div>

        <div className={styles.valuesGrid}>
          {values.map((value, idx) => (
            <div key={idx} className={styles.valueCard}>
              <div className={styles.valueHeader}>
                <div className={styles.valueIcon}>
                  <value.icon size={32} />
                </div>
                <div className={styles.valueContent}>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                  <div className={styles.featureList}>
                    {value.features.map((feature, fIdx) => (
                      <div key={fIdx} className={styles.featureItem}>
                        <CheckCircle size={18} className={styles.checkIcon} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Timeline */}
      <section className={styles.journeySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Journey</h2>
          <p className={`${styles.heroSubtitle} ${styles.marginTop1}`}>From a vision to Kenya's leading solar solutions provider</p>
        </div>

        <div className={styles.timeline}>
          {milestones.map((milestone, idx) => (
            <div key={idx} className={styles.milestone}>
              <div className={styles.milestoneLineWrap}>
                <div className={styles.milestoneYear}>
                  {milestone.year}
                </div>
                {idx < milestones.length - 1 && (
                  <div className={styles.line}></div>
                )}
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneBox}>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Meet Our Team</h2>
          <p className={`${styles.heroSubtitle} ${styles.marginTop1}`}>Passionate experts dedicated to your energy independence</p>
        </div>

        <div className={styles.teamGrid}>
          {team.map((member, idx) => (
            <div key={idx} className={styles.teamMember}>
              <div className={styles.avatar}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberSpecialty}>{member.specialty}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className={styles.certSection}>
        <h2>Certified & Trusted</h2>
        <div className={styles.certGrid}>
          {certifications.map((cert, idx) => (
            <div key={idx} className={styles.certCard}>
              <Award size={32} className={styles.certIcon} />
              <p className={styles.certLabel}>{cert}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <h2>Ready to Go Solar?</h2>
          <p>
            Join thousands of satisfied customers who have made the switch to clean, reliable solar energy.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.callBtn}>
              <Phone size={20} />
              Call: 0712345678
            </button>
            <button className={styles.quoteBtn}>
              <Mail size={20} />
              Get Free Quote
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
