import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Loader2, Home, Building, Map } from "lucide-react";
import { getApiEndpoint } from '@/utils/apiClient';
import styles from '@/styles/AddressSection.module.css';

interface Address {
  id: number;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  is_default: boolean;
  created_at: string;
}

const AddressSection = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(getApiEndpoint('/addresses'), {
        credentials: 'include',
        headers: {}
      });
      
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setMessage('');

    // Validation
    if (!formData.label || !formData.address_line1 || !formData.city || !formData.country) {
      setStatus('error');
      setMessage('Please fill in all required fields');
      return;
    }

    setStatus('loading');

    try {
      const url = editingAddress ? getApiEndpoint('/addresses') : getApiEndpoint('/addresses');
      const method = editingAddress ? 'PUT' : 'POST';
      
      const body = editingAddress 
        ? { ...formData, id: editingAddress.id }
        : formData;

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
        resetForm();
        fetchAddresses();
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to save address');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while saving address');
    } finally {
      if (status === 'loading') {
        setStatus('idle');
      }
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${getApiEndpoint('/addresses')}?id=${addressId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {}
      });

      const data = await response.json();
      
      if (data.success) {
        fetchAddresses();
      } else {
        alert(data.message || 'Failed to delete address');
      }
    } catch (error) {
      alert('An error occurred while deleting address');
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: false
    });
    setEditingAddress(null);
    setShowForm(false);
    setStatus('idle');
    setMessage('');
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <Home size={20} />;
      case 'office':
      case 'work':
        return <Building size={20} />;
      default:
        return <Map size={20} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <h2>Manage Addresses</h2>
        <p>Add, edit, or remove your shipping addresses</p>
      </div>

      {status !== 'idle' && (
        <motion.div 
          className={`${styles.statusMessage} ${status === 'success' ? styles.success : styles.error}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message}</span>
        </motion.div>
      )}

      <div className={styles.addressList}>
        {addresses.length === 0 ? (
          <div className={styles.emptyState}>
            <MapPin size={64} />
            <h3>No addresses yet</h3>
            <p>Add your first address to get started</p>
          </div>
        ) : (
          addresses.map((address) => (
            <motion.div
              key={address.id}
              className={styles.addressCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.addressHeader}>
                <div className={styles.addressIcon}>
                  {getAddressIcon(address.label)}
                </div>
                <div className={styles.addressInfo}>
                  <h4>{address.label}</h4>
                  {address.is_default && <span className={styles.defaultBadge}>Default</span>}
                </div>
                <div className={styles.addressActions}>
                  <button
                    onClick={() => handleEdit(address)}
                    className={styles.actionBtn}
                    title="Edit address"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className={styles.actionBtn}
                    title="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.addressDetails}>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}
                  {address.state && `, ${address.state}`}
                  {address.postal_code && ` ${address.postal_code}`}
                </p>
                <p>{address.country}</p>
                {address.phone && <p>Phone: {address.phone}</p>}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className={styles.addBtn}
        >
          <Plus size={20} />
          Add New Address
        </button>
      ) : (
        <motion.div
          className={styles.addressForm}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.formHeader}>
            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
            <button onClick={resetForm} className={styles.closeBtn}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Label *</label>
                <select
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select label</option>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Address Line 1 *</label>
              <input
                type="text"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleInputChange}
                placeholder="Street address"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Address Line 2</label>
              <input
                type="text"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleInputChange}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State/Province"
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="Postal/ZIP code"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  required
                />
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                <span>Set as default address</span>
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <>
                    <Loader2 size={20} className={styles.spinner} />
                    {editingAddress ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default AddressSection;
