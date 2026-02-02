"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from '@/styles/Header.module.css';
import { FaShoppingCart } from "react-icons/fa";
import { UserCircle, Search, X, Loader2 } from "lucide-react";
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/context/AuthContext';
import { buildMediaUrl } from '@/utils/media';
import useCartStore from '@/store/UseCartStore';

const Header: React.FC = () => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNavigatingToCart, setIsNavigatingToCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const userRole = user?.role;
  const cartItems = useCartStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const categories = [
    { id: "solar-inverters", name: "Solar Inverters", href: "/categories?category=Inverters" },
    { id: "solar-panels", name: "Solar Panels", href: "/categories?category=Solar%20Panels" },
    { id: "batteries", name: "Batteries & ESS", href: "/categories?category=Batteries" },
    { id: "outdoor-lights", name: "Solar Outdoor Lights", href: "/categories?category=Solar%20Lights" },
    { id: "accessories", name: "Accessories", href: "/categories?category=Mounting%20Accesories" },
  ];

  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      closeMobileMenu();
    }
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileMenu();
    };
    if (isMobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!navRef.current || !toggleRef.current || !target) return;

      if (navRef.current.contains(target) || toggleRef.current.contains(target)) {
        return;
      }

      closeMobileMenu();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMobileOpen]);

  return (
    <header className={styles.navWrapper}>
      {/* Logo */}
      <Link href="/" className={styles.logoContainer}>
        <Image 
          src="/remove-background.svg" 
          alt="Sunleaf Tech Logo" 
          width={45} 
          height={45}
          className={styles.logoImage}
          priority
        />
        <span className={styles.logoText}>Sunleaf Tech</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className={styles.desktop_nav}>
        <ul className={styles.navList}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/categories">Shop</Link></li>
          <li><Link href="/about">About Us</Link></li>
          <li><Link href="/contact">Contact Us</Link></li>
          <li>
            <form onSubmit={handleSearch} className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                <Search size={16} />
              </button>
            </form>
          </li>
          <li>
            <button 
              onClick={() => {
                setIsNavigatingToCart(true);
                router.push('/Cart');
              }}
              className={styles.cartTrigger}
              title="View Shopping Cart"
              disabled={isNavigatingToCart}
              style={{ 
                position: 'relative', 
                display: 'inline-block',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: isNavigatingToCart ? 'wait' : 'pointer'
              }}
            >
              {isNavigatingToCart ? (
                <Loader2 size={24} className={styles.spinner} />
              ) : (
                <FaShoppingCart size={24} />
              )}
              {cartCount > 0 && !isNavigatingToCart && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#facc15',
                    color: '#000000',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    borderRadius: '50%',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 2px',
                    lineHeight: 1,
                    border: '1px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </li>
          <li>
            <Link href="/Account" style={{ position: 'relative', display: 'inline-block' }}>
              {/* @ts-ignore - profile_picture may not be in User type yet */}
              {user?.profile_picture ? (
                <img 
                  src={buildMediaUrl(user.profile_picture)} 
                  alt="Profile" 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #facc15',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                />
              ) : (
                <UserCircle size={24} />
              )}
            </Link>
          </li>
          {userRole ? (
            <li><LogoutButton className={styles["logout-button"]} /></li>
          ) : (
            <li>
              <Link href="/login">
                <button className={styles["logout-button"]}>Login</button>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Toggle Button */}
      <button
        className={styles.menuToggle}
        onClick={toggleMobileMenu}
        ref={toggleRef}
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Navigation */}
      {/* Click-outside overlay */}
      <div
        className={`${styles.mobileOverlay} ${isMobileOpen ? styles.active : ""}`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileOpen}
      />

      <nav
        className={`${styles.mobile_nav} ${isMobileOpen ? styles.active : ""}`}
        aria-hidden={!isMobileOpen}
        aria-modal={isMobileOpen}
        role="dialog"
        ref={navRef}
      >
        <button 
          className={styles.mobileCloseBtn} 
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <div className={styles.mobileTopLinks}>
          <Link href="/about" onClick={closeMobileMenu} className={styles.mobileTopLink}>
            About Us
          </Link>
          <Link href="/contact" onClick={closeMobileMenu} className={styles.mobileTopLink}>
            Contact Us
          </Link>
        </div>

        <div className={styles.mobileSidebarHeader}>
          <span>Categories</span>
        </div>

        <ul className={styles.mobileMenuList}>
          {categories.map((c) => (
            <li key={c.id} className={styles.mobileMenuItem}>
              <Link href={c.href} onClick={closeMobileMenu}>
                <span className={styles.mobileMenuChevron}>›</span>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>


      </nav>
    </header>
  );
};

export default Header;
