"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getApiUrl } from '@/utils/apiUrl';

import styles from '@/styles/Sidebar.module.css';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Image as ImageIcon,
  Warehouse
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const [heroBannersUrl, setHeroBannersUrl] = useState('');
  const [categoryBannersUrl, setCategoryBannersUrl] = useState('');
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    userManagement: false,
    products: false,
    payment: false,
    orders: false,
    content: false,
    inventory: false,
  });

  const [orderCounts, setOrderCounts] = useState({
    pending: 0,
    shipped: 0,
    completed: 0,
    returns: 0,
  });

  // Calculate banner URLs at runtime to avoid SSR issues
  useEffect(() => {
    setHeroBannersUrl(getApiUrl('/api/admin/manage_hero_banners'));
    setCategoryBannersUrl(getApiUrl('/api/admin/manage_category_banners'));
  }, []);

  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const params = new URLSearchParams({
          start_date: start.toISOString().slice(0, 10),
          end_date: now.toISOString().slice(0, 10),
        });

        const url = getApiUrl('/api/admin/getDashboardMetrics');
        const response = await fetch(url, {
          credentials: 'include',
        });
        
        if (!response.ok) return;

        const data = await response.json();
        if (!data?.orders_by_status) return;

        const byStatus: Record<string, number> = {};
        for (const item of data.orders_by_status as Array<any>) {
          if (!item?.status) continue;
          const key = String(item.status).toLowerCase();
          byStatus[key] = Number(item.count || 0);
        }

        setOrderCounts({
          pending: byStatus["pending"] ?? 0,
          shipped: byStatus["shipped"] ?? byStatus["in_transit"] ?? 0,
          completed: byStatus["completed"] ?? byStatus["delivered"] ?? 0,
          returns: byStatus["returns"] ?? byStatus["returned"] ?? 0,
        });
      } catch (err) {
        console.error("Failed to load sidebar order counts", err);
      }
    };

    fetchOrderCounts();
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isActive = (path: string) => pathname === path;
  const isActiveParent = (paths: string[]) => paths.some(path => pathname?.startsWith(path));

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image
          src="/remove-background.svg"
          alt="Penguin Logo"
          width={120}
          height={40}
          priority
        />
      </div>

      {/* Search */}
      <div className={styles.searchBox}>
        <input type="text" placeholder="Search" />
      </div>

      {/* Dashboard */}
      <Link href="/admin-dashboard" className={`${styles.menuItem} ${isActive('/admin-dashboard') ? styles.active : ''}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </Link>

      {/* User Management */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/users', '/admin-dashboard/permissions', '/admin-dashboard/activity-logs']) ? styles.active : ''}`}
          onClick={() => toggleMenu("userManagement")}
        >
          <Users size={18} />
          <span>User Management</span>
          {openMenus.userManagement ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.userManagement && (
          <div className={styles.subMenu}>
            <Link href="/admin-dashboard/users" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/users') ? styles.active : ''}`}>
              Users
            </Link>
            <span className={`${styles.subMenuItem} ${styles.dormant}`}>
              Permissions
              <small className={styles.dormantText}> (Coming Soon)</small>
            </span>
            <span className={`${styles.subMenuItem} ${styles.dormant}`}>
              Activity Logs
              <small className={styles.dormantText}> (Coming Soon)</small>
            </span>
          </div>
        )}
      </div>

      {/* Products */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/products']) ? styles.active : ''}`}
          onClick={() => toggleMenu("products")}
        >
          <Package size={18} />
          <span>Products</span>
          {openMenus.products ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.products && (
          <div className={styles.subMenu}>
            <Link href="/admin-dashboard/products/allProducts" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/products/allProducts') ? styles.active : ''}`}>
              All Products
            </Link>
            <Link href="/admin-dashboard/reviews" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/reviews') ? styles.active : ''}`}>
              Reviews
            </Link>
          </div>
        )}
      </div>
      {/* Payment */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/payment']) ? styles.active : ''}`}
          onClick={() => toggleMenu("payment")}
        >
          <CreditCard size={18} />
          <span>Payment</span>
          {openMenus.payment ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.payment && (
          <div className={styles.subMenu}>
            <Link href="/admin-dashboard/payment/allPayments" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/payment/allPayments') ? styles.active : ''}`}>
              All Payments
            </Link>
            <Link href="/admin-dashboard/payment/quotes" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/payment/quotes') ? styles.active : ''}`}>
              Quotes
            </Link>
            <Link href="/admin-dashboard/payment/invoices" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/payment/invoices') ? styles.active : ''}`}>
              Invoices
            </Link>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/inventory']) ? styles.active : ''}`}
          onClick={() => toggleMenu("inventory")}
        >
          <Warehouse size={18} />
          <span>Inventory</span>
          {openMenus.inventory ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.inventory && (
          <div className={styles.subMenu}>
            <Link href="/admin-dashboard/inventory" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/inventory') ? styles.active : ''}`}>
              Overview
            </Link>
            <Link href="/admin-dashboard/inventory/movements" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/inventory/movements') ? styles.active : ''}`}>
              Stock Movements
            </Link>
            <Link href="/admin-dashboard/inventory/adjustments" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/inventory/adjustments') ? styles.active : ''}`}>
              Adjust Stock
            </Link>
            <Link href="/admin-dashboard/inventory/low-stock" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/inventory/low-stock') ? styles.active : ''}`}>
              Low Stock Alerts
            </Link>
          </div>
        )}
      </div>

      {/* Orders */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/orders']) ? styles.active : ''}`}
          onClick={() => toggleMenu("orders")}
        >
          <Truck size={18} />
          <span>Orders</span>
          {openMenus.orders ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.orders && (
          <div className={styles.subMenu}>
            <Link href="/admin-dashboard/orders/pending" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/orders/pending') ? styles.active : ''}`}>
              <span>Pending</span>
              <span className={styles.badge}>{orderCounts.pending}</span>
            </Link>
            <Link href="/admin-dashboard/orders/shipped" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/orders/shipped') ? styles.active : ''}`}>
              <span>Shipped</span>
              <span className={styles.badge}>{orderCounts.shipped}</span>
            </Link>
            <Link href="/admin-dashboard/orders/completed" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/orders/completed') ? styles.active : ''}`}>
              <span>Completed</span>
              <span className={styles.badge}>{orderCounts.completed}</span>
            </Link>
            <Link href="/admin-dashboard/orders/returns" className={`${styles.subMenuItem} ${isActive('/admin-dashboard/orders/returns') ? styles.active : ''}`}>
              <span>Returns</span>
              <span className={styles.badge}>{orderCounts.returns}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Content Management */}
      <div>
        <div
          className={`${styles.menuItem} ${isActiveParent(['/admin-dashboard/content']) ? styles.active : ''}`}
          onClick={() => toggleMenu("content")}
        >
          <ImageIcon size={18} />
          <span>Content</span>
          {openMenus.content ? (
            <ChevronDown size={16} className={styles.chevron} />
          ) : (
            <ChevronRight size={16} className={styles.chevron} />
          )}
        </div>
        {openMenus.content && (
          <div className={styles.subMenu}>
            <a 
              href={heroBannersUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.subMenuItem}
            >
              Hero Banners
            </a>
            <a 
              href={categoryBannersUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className={styles.subMenuItem}
            >
              Category Banners
            </a>
          </div>
        )}
      </div>

      {/* Settings */}
      <Link href="/admin-dashboard/settings" className={`${styles.menuItem} ${isActive('/admin-dashboard/settings') ? styles.active : ''}`}>
        <Settings size={18} />
        <span>Settings</span>
      </Link>
    </aside>
  );
};

export default Sidebar;
