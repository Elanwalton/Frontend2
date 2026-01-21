'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Phone, Clock } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const whatsappNumber = '254712616546'; //
  const message = 'Hi there! I would like to inquire about your solar products.';

  // Only show on home page
  if (pathname !== '/') {
    return null;
  }

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* WhatsApp Widget */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: 9999
      }}>
        {/* Expanded Chat Card */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '0',
              width: '320px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              padding: '1.25rem',
              position: 'relative'
            }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <X size={16} color="white" />
              </button>
              <h3 style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: '0 0 0.25rem 0'
              }}>
                Chat with us!
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                We typically reply instantly
              </p>
            </div>

            {/* Chat Bubble */}
            <div style={{
              padding: '1.5rem',
              background: '#f5f5f5'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '12px 12px 12px 2px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#1a1a1a',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  Hi there! 👋 Thanks for stopping by. How can I help you today?
                </p>
              </div>

              {/* Agent Info */}
              <div
                onClick={handleWhatsAppClick}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 211, 102, 0.2)';
                  e.currentTarget.style.borderColor = '#25D366';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{
                  position: 'relative',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'white'
                  }}>
                    ST
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    background: '#25D366',
                    border: '2px solid white',
                    borderRadius: '50%',
                    animation: 'pulse-green 2s infinite'
                  }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <h4 style={{
                      color: '#1a1a1a',
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      Sunleaf Tech
                    </h4>
                  </div>
                  <p style={{
                    color: '#666',
                    fontSize: '0.875rem',
                    margin: '0 0 0.25rem 0'
                  }}>
                    Sales & Customer Support
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#25D366',
                      borderRadius: '50%'
                    }} />
                    <span style={{
                      color: '#25D366',
                      fontSize: '0.8125rem',
                      fontWeight: '500'
                    }}>
                      Available
                    </span>
                  </div>
                </div>

                <Phone 
                  size={20} 
                  color="#25D366"
                  style={{
                    flexShrink: 0
                  }}
                />
              </div>
            </div>

            {/* Footer Button */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'white',
              borderTop: '1px solid #f0f0f0'
            }}>
              <button
                onClick={handleWhatsAppClick}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <MessageCircle size={18} />
                Reach us on WhatsApp
              </button>
            </div>

            {/* Business Hours */}
            <div style={{
              padding: '0.75rem 1.5rem',
              background: '#f9f9f9',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <Clock size={14} color="#666" />
              <span style={{
                color: '#666',
                fontSize: '0.8125rem'
              }}>
                Mon-Fri: 8AM - 6PM, Sat: 9AM - 4PM
              </span>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: 'bounce 2s infinite',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(37, 211, 102, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
          }}
        >
          {isOpen ? (
            <X size={28} color="white" />
          ) : (
            <MessageCircle size={28} color="white" />
          )}
          
          {/* Notification Badge */}
          {!isOpen && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              background: '#EF4444',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'white',
              animation: 'pulse-red 2s infinite'
            }}>
              1
            </div>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-green {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        @keyframes pulse-red {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }

        @media (max-width: 480px) {
          div[style*="width: 320px"] {
            width: calc(100vw - 40px) !important;
          }
        }
      `}</style>
    </>
  );
}
