"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from '@/styles/Header.module.css';
import { FaShoppingCart } from "react-icons/fa";
import { UserCircle, Search } from "lucide-react";
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/context/AuthContext';
import useCartStore from '@/store/UseCartStore';

const Header: React.FC = () => {
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const userRole = user?.role;
  const cartItems = useCartStore((state) => state.cartItems);
  const cartCount = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/Products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
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
          src="/remove-background (1).svg" 
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
            <Link href="/Cart" style={{ position: 'relative', display: 'inline-block' }}>
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
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
            </Link>
          </li>
          <li><Link href="/Account"><UserCircle size={24} /></Link></li>
          {userRole ? (
            <li><LogoutButton /></li>
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
        <ul>
          <li><Link href="/" onClick={closeMobileMenu}>Home</Link></li>
          <li><Link href="/categories" onClick={closeMobileMenu}>Shop</Link></li>
          <li>
            <Link href="/Cart" onClick={closeMobileMenu} style={{ position: 'relative', display: 'inline-block' }}>
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
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
            </Link>
          </li>
          <li><Link href="/Account" onClick={closeMobileMenu}><UserCircle size={24} /></Link></li>
          {userRole ? (
            <li><LogoutButton /></li>
          ) : (
            <li>
              <Link href="/login" onClick={closeMobileMenu}>
                <button className={styles["logout-button"]}>Login</button>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
