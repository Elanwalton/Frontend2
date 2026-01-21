'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ShoppingCart, ShoppingBag, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Get cart count from localStorage
    const cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
      try {
        const items = JSON.parse(cartItems);
        setCartCount(items.length || 0);
      } catch (error) {
        setCartCount(0);
      }
    }

    // Set active tab based on current path
    const path = window.location.pathname;
    if (path === '/') {
      setActiveTab('home');
    } else if (path.includes('/categories')) {
      setActiveTab('shop');
    } else if (path.includes('/Cart')) {
      setActiveTab('cart');
    } else if (path.includes('/Account')) {
      setActiveTab('account');
    }
  }, []);

  const handleNavClick = async (itemId: string) => {
    setActiveTab(itemId);
    
    switch (itemId) {
      case 'home':
        router.push('/');
        break;
      case 'shop':
        router.push('/categories');
        break;
      case 'cart':
        router.push('/Cart');
        break;
      case 'account':
        router.push('/Account');
        break;
      case 'logout':
        // Handle logout logic using AuthContext
        await logout();
        break;
      case 'login':
        // Navigate to login page
        router.push('/login');
        break;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', color: '#F59E0B' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop', color: '#667eea' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', color: '#10B981', badge: cartCount },
    { id: 'account', icon: User, label: 'Account', color: '#8B5CF6' },
    { 
      id: user ? 'logout' : 'login', 
      icon: user ? LogOut : LogIn, 
      label: user ? 'Logout' : 'Login', 
      color: '#EF4444' 
    }
  ];

  // Only show on mobile screens
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(media.matches);
    media.addEventListener('change', handler);

    return () => media.removeEventListener('change', handler);
  }, []);

  // Only show on mobile screens
  if (!isMobile) {
    return null;
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(245, 158, 11, 0.2)',
      padding: '0.58rem 1rem 0.4rem',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.44rem',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                minWidth: '60px'
              }}
            >
              <div style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '14px',
                background: isActive 
                  ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` 
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isActive 
                  ? `0 8px 20px ${item.color}40, 0 0 0 2px ${item.color}30` 
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                {item.id === 'account' && user?.profile_picture ? (
                  // @ts-ignore - profile_picture may not be in User type yet
                  <img 
                    src={`/images/${user.profile_picture}`} 
                    alt="Profile" 
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Icon
                    size={22}
                    color={isActive ? 'white' : 'rgba(255, 255, 255, 0.6)'}
                    style={{
                      transition: 'all 0.3s ease'
                    }}
                  />
                )}
                
                {item.badge && item.badge > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    borderRadius: '10px',
                    padding: '0.15rem 0.4rem',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0f172a',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                    animation: item.id === 'cart' ? 'pulse 2s infinite' : 'none'
                  }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              
              <span style={{
                fontSize: '0.64rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? item.color : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s ease',
                letterSpacing: '0.3px',
                textTransform: 'uppercase'
              }}>
                {item.label}
              </span>

              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-0.75rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 10px ${item.color}`,
                  animation: 'glow 2s infinite'
                }} />
              )}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        button:active {
          transform: translateY(-2px) scale(0.98);
        }

        @media (max-width: 380px) {
          nav {
            padding: 0.44rem 0.5rem 0.3rem;
          }
        }
      `}</style>
    </nav>
  );
}
