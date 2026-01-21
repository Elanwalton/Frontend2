"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '@/styles/Account.module.css';
import { 
  Camera, 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Lock, 
  LogOut,
  Edit2,
  Mail,
  Phone,
  UserCircle,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import OrdersSection from '@/components/Orders';
import LogoutSection from '@/components/LogoutSection';
import Breadcrumbs from '@/components/Breadcrumbs';
import PasswordSection from '@/components/PasswordSection';
import AddressSection from '@/components/AddressSection';
import ServiceHighlights from '@/components/ServicesHighlights';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

function AccountPageContent() {
  const [activeTab, setActiveTab] = useState("personal");
  const { user, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    email: '',
    phone: ''
  });
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [updateMessage, setUpdateMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        second_name: user.second_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      // @ts-ignore - profile_picture may not be in User type yet
      setProfilePicture(user.profile_picture || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateStatus('idle');
    setUpdateMessage('');
    
    try {
      const response = await fetch(getApiEndpoint('/update-profile'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setUpdateStatus('success');
        setUpdateMessage('Profile updated successfully!');
        await checkAuth(); // Refresh user data
        // Clear success message after 5 seconds
        setTimeout(() => {
          setUpdateStatus('idle');
          setUpdateMessage('');
        }, 5000);
      } else {
        setUpdateStatus('error');
        setUpdateMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage('An error occurred while updating profile');
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUpdateStatus('error');
      setUpdateMessage('Please select a valid image file (JPG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUpdateStatus('error');
      setUpdateMessage('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    setUpdateStatus('idle');
    setUpdateMessage('');

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await fetch(getApiEndpoint('/upload-profile-picture'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProfilePicture(data.profile_picture);
        setUpdateStatus('success');
        setUpdateMessage('Profile picture updated successfully!');
        await checkAuth(); // Refresh user data
        // Clear success message after 5 seconds
        setTimeout(() => {
          setUpdateStatus('idle');
          setUpdateMessage('');
        }, 5000);
      } else {
        setUpdateStatus('error');
        setUpdateMessage(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage('An error occurred while uploading profile picture');
    } finally {
      setUploadingPicture(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const menuItems = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "address", label: "Manage Address", icon: MapPin },
    { id: "payment", label: "Payment Method", icon: CreditCard },
    { id: "password", label: "Password Manager", icon: Lock },
    { id: "logout", label: "Logout", icon: LogOut },
  ];

  return (
    <>
    <Breadcrumbs items={[{ label: 'My Account' }]} />
    <div className={styles.container}>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.headerContent}>
          <div className={styles.iconBadge}>
            <UserCircle size={32} />
          </div>
          <div>
            <h1 className={styles.heading}>My Account</h1>
            <p className={styles.breadcrumb}>Manage your profile and preferences</p>
          </div>
        </div>
      </motion.div>

      <div className={styles.wrapper}>
        {/* Sidebar */}
        <motion.aside 
          className={styles.sidebar}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className={styles.sidebarHero}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <span className={styles.sidebarHeroIcon}>
              <Zap size={18} />
            </span>
            <div className={styles.sidebarHeroCopy}>
              <h3>Account Shortcuts</h3>
              <p>All your essentials in one swipe.</p>
            </div>
          </motion.div>

          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ""}`}
                onClick={() => setActiveTab(item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </motion.aside>

        {/* Main Section */}
        <motion.main 
          className={styles.main}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === "personal" && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.sectionHeader}>
                  <h2>Personal Information</h2>
                  <p>Update your personal details and profile picture</p>
                </div>
                
                <div className={styles.avatarSection}>
                  <div className={styles.avatarWrapper}>
                    <img
                      src={profilePicture ? `/images/${profilePicture}` : "https://via.placeholder.com/120"}
                      alt="Profile"
                      className={styles.avatar}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                    />
                    <button 
                      className={styles.editBtn}
                      onClick={handleProfilePictureClick}
                      disabled={uploadingPicture}
                      type="button"
                    >
                      {uploadingPicture ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    </button>
                    {uploadingPicture && (
                      <div className={styles.uploadOverlay}>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <div className={styles.avatarInfo}>
                    <h3>{user?.first_name} {user?.second_name}</h3>
                    <p>Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {updateStatus !== 'idle' && (
                  <div className={`${styles.statusMessage} ${updateStatus === 'success' ? styles.success : styles.error}`}>
                    {updateStatus === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{updateMessage}</span>
                  </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label>
                        <User size={16} />
                        First Name *
                      </label>
                      <input 
                        type="text" 
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="First name" 
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>
                        <User size={16} />
                        Last Name *
                      </label>
                      <input 
                        type="text" 
                        name="second_name"
                        value={formData.second_name}
                        onChange={handleInputChange}
                        placeholder="Last name" 
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      <Mail size={16} />
                      Email Address *
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email address" 
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone number" 
                    />
                  </div>

                  <button type="submit" className={styles.updateBtn}>
                    <Edit2 size={20} />
                    Update Changes
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OrdersSection />
              </motion.div>
            )}

            {activeTab === "address" && (
              <motion.div
                key="address"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AddressSection />
              </motion.div>
            )}

            {activeTab === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={styles.comingSoon}
              >
                <div className={styles.comingSoonIcon}>
                  <CreditCard size={64} />
                </div>
                <h3>Payment Methods</h3>
                <p>Manage your payment methods and billing information</p>
                <span className={styles.badge}>Coming Soon</span>
              </motion.div>
            )}

            {activeTab === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PasswordSection />
              </motion.div>
            )}

            {activeTab === "logout" && (
              <motion.div
                key="logout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LogoutSection />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
      <ServiceHighlights />
    </div>
     <Footer />
     </>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountPageContent />
    </ProtectedRoute>
  );
}
