'use client';

import styles from './QuotationResult.module.css';
import type { SolarQuoteResult } from './types';
import { getApiBaseUrl } from '@/utils/apiUrl';

interface Props {
  data: SolarQuoteResult;
  onStartOver: () => void;
}

export default function QuotationResult({ data, onStartOver }: Props) {
  const company = {
    name: 'SUNLEAF TECHNOLOGIES',
    tagline: 'Solar Energy Solutions',
    email: 'novagrouke@gmail.com',
    phone: '+254 712 616546',
    address: '00100-17902 NAIROBI, Kenya',
    website: 'www.sunleaaftechnologies.co.ke',
  };

  const preparedBy = 'Sunleaf Technologies';
  const referenceDate = new Date().toLocaleDateString();
  const customerName = data.customer_name || 'Customer';
  const customerEmail = data.customer_email || '';

  const pdfHref = (() => {
    if (!data.file_path) return '';
    const apiBase = getApiBaseUrl();
    const backendOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${backendOrigin}/${data.file_path}`;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.badge}>
          <div className={styles.badgeLabel}>Quote</div>
          <div className={styles.badgeNumber}>#{data.quote_number}</div>
        </div>

        <div className={styles.companyInfo}>
          <div className={styles.companyName}>{company.name}</div>
          <div className={styles.companyTagline}>{company.tagline}</div>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>📧 {company.email}</div>
            <div className={styles.contactItem}>📱 {company.phone}</div>
            <div className={styles.contactItem}>📍 {company.address}</div>
            <div className={styles.contactItem}>🌐 {company.website}</div>
          </div>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoSection}>
          <h3>Client Information</h3>
          <div className={styles.clientName}>{customerName}</div>
          {customerEmail ? (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email:</span>
              <span className={styles.detailValue}>{customerEmail}</span>
            </div>
          ) : null}
        </div>

        <div className={styles.infoSection}>
          <h3>Quote Details</h3>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Quote Number:</span>
            <span className={styles.detailValue}>#{data.quote_number}</span>
          </div>
          {data.created_at && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Created:</span>
              <span className={styles.detailValue}>{new Date(data.created_at).toLocaleDateString()}</span>
            </div>
          )}
          {data.expiry_date && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Expiry:</span>
              <span className={styles.detailValue}>{new Date(data.expiry_date).toLocaleDateString()}</span>
            </div>
          )}
          {data.status && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status:</span>
              <span className={`${styles.statusBadge} ${styles[data.status]}`}>{data.status}</span>
            </div>
          )}
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Reference Date:</span>
            <span className={styles.detailValue}>{referenceDate}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Prepared By:</span>
            <span className={styles.detailValue}>{preparedBy}</span>
          </div>
        </div>
      </div>

      <div className={styles.itemsSection}>
        <h2 className={styles.sectionTitle}>Quote Items</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Description</th>
                <th className={styles.center}>Qty</th>
                <th>Unit Price</th>
                <th className={styles.right}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => {
                const lineTotal = item.quantity * item.price;
                return (
                  <tr key={idx}>
                    <td>
                      <div className={styles.itemDescription}>{item.name}</div>
                      <div className={styles.itemSub}>{item.description}</div>
                    </td>
                    <td className={styles.center}>{item.quantity}</td>
                    <td>
                      <span className={styles.priceFinal}>
                        KES {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className={styles.right}>
                      <strong>
                        KES {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.totalsSection}>
        <div className={styles.totalsGrid}>
          <div className={`${styles.totalRow} ${styles.subtotalRow}`}>
            <span>Subtotal:</span>
            <span>KES {data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.subtotalRow}`}>
            <span>VAT ({data.vat_rate}%):</span>
            <span>KES {data.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.grandRow}`}>
            <span>Grand Total:</span>
            <span>KES {data.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {data.file_path ? (
          <a className={styles.download} href={pdfHref} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        ) : (
          <div className={styles.noPdf}>PDF not generated (server missing dompdf).</div>
        )}

        <button className={styles.startOver} onClick={onStartOver}>
          Start Over
        </button>
      </div>

      <div className={styles.footerNote}>
        <strong>Note:</strong> I hope that this offer is what you are looking for. I am available to provide any additional information you may require.
        <br />
        <br />
        <strong>Best regards,</strong>
        <br />
        {preparedBy}
      </div>

      <div className={styles.signatureSection}>
        <div className={styles.signatureTitle}>Client Approval</div>
        <div className={styles.signatureFields}>
          <div className={styles.signatureField}>
            <label>Name</label>
            <div className={styles.signatureLine} />
          </div>
          <div className={styles.signatureField}>
            <label>Date</label>
            <div className={styles.signatureLine} />
          </div>
          <div className={styles.signatureField}>
            <label>Signature</label>
            <div className={styles.signatureLine} />
          </div>
          <div className={styles.signatureField}>
            <label>Location</label>
            <div className={styles.signatureLine} />
          </div>
        </div>
      </div>

      <div className={styles.disclaimer}>
        <strong>Disclaimer:</strong> This quotation is non-binding. Final sizing requires installer verification.
      </div>
    </div>
  );
}
