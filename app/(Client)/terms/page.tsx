"use client";
import React, { useState } from 'react';
import { 
  FileText, Shield, CreditCard, AlertTriangle, Scale, Mail,
  CheckCircle, ChevronDown, ChevronUp, Phone, MapPin, Calendar
} from 'lucide-react';
import styles from './terms.module.css';

const TermsOfServicePage = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      id: 1,
      icon: FileText,
      title: "Agreement to Terms",
      content: `By accessing or using Sunleaf Technology Solutions' website, you agree to be bound by these Terms of Service. These terms apply to all users and customers within Kenya.
      
By continuing to use our services, you acknowledge that you have read, understood, and agree to comply with these terms. If you do not agree with any part of these terms, please discontinue use of our services immediately.

These terms constitute a legally binding agreement between you and Sunleaf Technology Solutions Ltd.`
    },
    {
      id: 2,
      icon: CreditCard,
      title: "Product Information & Pricing",
      content: `We strive to provide accurate product descriptions and pricing in Kenyan Shillings (KES). However, we do not warrant that all information is error-free. We reserve the right to correct any errors and update information at any time.

All prices displayed on our website are in Kenyan Shillings (KES) and include applicable VAT unless otherwise stated. Product specifications, features, and images are provided by manufacturers and are subject to change without notice.

We reserve the right to:
• Modify product prices at any time
• Correct pricing errors or inaccuracies
• Update product specifications and availability
• Discontinue products without prior notice

In case of a pricing error, we will notify you and give you the option to cancel or proceed with the corrected price.`
    },
    {
      id: 3,
      icon: CreditCard,
      title: "Payments (Kenya)",
      content: `We accept payments via M-Pesa, Kenyan bank cards, and approved financing partners. All transactions are processed in KES.

Accepted Payment Methods:
• M-Pesa (Safaricom, Airtel Money)
• Debit/Credit Cards (Visa, Mastercard)
• Bank Transfers (All major Kenyan banks)
• Financing Options (through approved partners)

Payment Terms:
• Full payment is required before product delivery unless otherwise agreed
• For custom installations, a 50% deposit may be required
• Financing options are subject to credit approval
• All payments are non-refundable except as provided in our refund policy

Payment Security:
We use industry-standard encryption and secure payment gateways to protect your financial information. We do not store credit card details on our servers.`
    },
    {
      id: 4,
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: `Sunleaf Technology Solutions shall not be liable for any direct, indirect, or consequential damages resulting from the use of our products. Users are advised to seek professional installation by our certified Kenyan technicians.

Limitation of Liability:
Sunleaf Technology Solutions provides solar energy products and services "as is" and shall not be held liable for:
• Improper installation by unauthorized technicians
• Damage resulting from misuse or negligence
• Power output variations due to weather conditions
• Indirect or consequential damages
• Loss of revenue or business interruption

Professional Installation Required:
We strongly recommend using our certified technicians for all installations. Installations performed by unauthorized personnel may void warranties and expose you to safety risks.

Product Warranties:
Product warranties are provided by manufacturers and are subject to their terms and conditions. Sunleaf Technology Solutions acts as an intermediary and is not responsible for manufacturer warranty claims.

Maximum Liability:
In no event shall our total liability exceed the amount paid for the specific product or service in question.`
    },
    {
      id: 5,
      icon: Scale,
      title: "Governing Law",
      content: `These terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes shall be resolved in the competent courts of Nairobi.

Jurisdiction:
These Terms of Service are governed by the laws of the Republic of Kenya, without regard to conflict of law principles.

Dispute Resolution:
In the event of any dispute arising from these terms or your use of our services:
1. Initial Resolution: Contact our customer service team for amicable resolution
2. Mediation: If unresolved, disputes may be referred to mediation
3. Legal Action: Unresolved disputes shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya

Applicable Laws:
• Consumer Protection Act (Kenya)
• Sale of Goods Act
• Energy Act and regulations by Energy and Petroleum Regulatory Authority (EPRA)
• Kenya Revenue Authority (KRA) tax regulations

Language:
These terms are written in English, which shall be the governing language for all interpretations.`
    },
    {
      id: 6,
      icon: Mail,
      title: "Contact Information",
      content: `For any legal inquiries, please reach out to our Nairobi legal team at legal@sunleafenergy.com.

Legal Department:
Email: legal@sunleafenergy.com
Phone: +254 712 345 678
Address: Sunleaf Technology Solutions Ltd, Nairobi, Kenya

Customer Support:
For general inquiries and customer support:
Email: hello@sunleafenergy.com
Phone: 0712 345 678
WhatsApp: +254 712 345 678

Office Hours:
Monday - Friday: 8:00 AM - 6:00 PM EAT
Saturday: 9:00 AM - 4:00 PM EAT
Sunday: Closed

Response Time:
We aim to respond to all inquiries within 24-48 business hours.`
    }
  ];

  const additionalTerms = [
    {
      title: "User Accounts",
      points: [
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must provide accurate and complete information during registration",
        "You must notify us immediately of any unauthorized account access",
        "We reserve the right to suspend or terminate accounts that violate these terms"
      ]
    },
    {
      title: "Intellectual Property",
      points: [
        "All content on our website is owned by Sunleaf Technology Solutions or licensed",
        "You may not reproduce, distribute, or create derivative works without permission",
        "Product images and specifications are property of respective manufacturers",
        "Our trademarks and logos may not be used without written consent"
      ]
    },
    {
      title: "Privacy & Data Protection",
      points: [
        "We collect and process personal data in accordance with Kenyan data protection laws",
        "Your information is used solely for order processing and customer service",
        "We do not sell or share your data with third parties except as required by law",
        "See our Privacy Policy for detailed information on data handling"
      ]
    },
    {
      title: "Delivery & Installation",
      points: [
        "Delivery timelines are estimates and may vary based on location",
        "Free delivery applies to select areas within Nairobi",
        "Installation services are provided by certified technicians",
        "Customer must provide safe access to installation sites"
      ]
    },
    {
      title: "Returns & Refunds",
      points: [
        "Products may be returned within 30 days if unopened and unused",
        "Custom orders and installations are non-refundable",
        "Refunds are processed within 14 business days of approval",
        "Customer is responsible for return shipping costs except for defective products"
      ]
    },
    {
      title: "Warranty & Support",
      points: [
        "Manufacturer warranties apply to all products",
        "Extended warranty options available for purchase",
        "Technical support available during business hours",
        "Warranty claims must be submitted within the warranty period"
      ]
    }
  ];

  return (
    <div className={styles.termsWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroHeader}>
            <FileText className={styles.heroIcon} />
            <h1>Terms of Service</h1>
          </div>
          <div className={styles.heroMeta}>
            <Calendar size={20} />
            <p>Last Updated: January 17, 2026</p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className={styles.intro}>
        <div className={styles.introContent}>
          <div className={styles.noticeBox}>
            <div className={styles.noticeFlex}>
              <AlertTriangle className={styles.alertIcon} />
              <div className={styles.noticeText}>
                <h2>Important Notice</h2>
                <p>
                  Please read these terms carefully before using our services. By accessing or using Sunleaf Technology Solutions' 
                  website and services, you agree to be legally bound by these Terms of Service. These terms apply to all users 
                  and customers within Kenya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms Sections */}
      <section className={styles.mainSections}>
        <div className={styles.sectionsList}>
          <div className={styles.sectionsContainer}>
            {sections.map((section) => (
              <div key={section.id} className={styles.sectionItem}>
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className={styles.sectionTrigger}
                >
                  <div className={styles.triggerLeft}>
                    <div className={styles.iconWrap}>
                      <section.icon size={24} />
                    </div>
                    <h2>
                      {section.id}. {section.title}
                    </h2>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronUp className={styles.chevronIcon} />
                  ) : (
                    <ChevronDown className={styles.chevronIcon} />
                  )}
                </button>
                
                {expandedSection === section.id && (
                  <div className={styles.sectionBody}>
                    <div className={styles.sectionText}>
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className={styles.additional}>
        <div className={styles.additionalContent}>
          <h2>Additional Terms & Conditions</h2>
          
          <div className={styles.termsGrid}>
            {additionalTerms.map((term, idx) => (
              <div key={idx} className={styles.termCard}>
                <h3>{term.title}</h3>
                <div className={styles.termList}>
                  {term.points.map((point, pIdx) => (
                    <div key={pIdx} className={styles.termPoint}>
                      <CheckCircle size={18} className={styles.checkIcon} />
                      <span className={styles.pointText}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact}>
        <div className={styles.contactBox}>
          <h2>Questions About Our Terms?</h2>
          <p>
            If you have any questions or concerns about these Terms of Service, our legal team is here to help.
          </p>
          
          <div className={styles.cardsGrid}>
            <div className={styles.miniCard}>
              <div className={styles.cardHeader}>
                <div className={styles.smallIcon}>
                  <Mail size={24} />
                </div>
                <div className={styles.cardTitle}>
                  <h3>Legal Inquiries</h3>
                  <span>For legal matters</span>
                </div>
              </div>
              <a href="mailto:legal@sunleafenergy.com" className={styles.contactLink}>
                legal@sunleafenergy.com
              </a>
            </div>

            <div className={styles.miniCard}>
              <div className={styles.cardHeader}>
                <div className={styles.smallIcon}>
                  <Phone size={24} />
                </div>
                <div className={styles.cardTitle}>
                  <h3>Customer Support</h3>
                  <span>For general questions</span>
                </div>
              </div>
              <a href="tel:+254712345678" className={styles.contactLink}>
                +254 712 345 678
              </a>
            </div>
          </div>

          <div className={styles.locationBar}>
            <MapPin size={20} color="#0ea5e9" />
            <p>
              <strong>Office Location:</strong> Sunleaf Technology Solutions Ltd, Nairobi, Kenya
            </p>
          </div>
        </div>
      </section>

      {/* Acceptance Notice */}
      <section className={styles.acceptance}>
        <div className={styles.acceptanceInner}>
          <Shield className={styles.shieldIcon} />
          <h2>Your Acceptance of These Terms</h2>
          <p>
            By using our website and services, you acknowledge that you have read these Terms of Service and agree to be 
            bound by them. We reserve the right to update these terms at any time, and continued use of our services 
            constitutes acceptance of any modifications.
          </p>
          <p className={styles.updateTimestamp}>
            Last updated: January 17, 2026
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;
