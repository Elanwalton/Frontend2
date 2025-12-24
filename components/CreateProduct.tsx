import React, { useState } from "react";
import axios from 'axios';
import { getApiUrl } from '@/utils/apiUrl';
import styles from '@/styles/CreateProduct.module.css';
const DEFAULT_CATEGORIES = [
  "Batteries",
  "Inverters",
  "Solar Water heaters",
  "solar panels",
  "Mounting Accesories",
  "Solar Outdoor Lights",
  "others"
];

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  quantity: number;
  status: string;
  revenue: number;
  rating: number;
  main_image_url: string;
  thumbnails: string[];
}

interface CreateProductModalProps {
  onClose: () => void;
  onProductAdded: (newProduct: Omit<Product, "id">) => Promise<void>;
  isSubmitting?: boolean;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({ onClose, onProductAdded }) => {
  // Text fields
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [visibility, setVisibility] = useState<"published"|"scheduled"|"hidden">("published");

  // Image state
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Upload handlers
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("main_image", file);
    try {
      setIsUploading(true);
      const res = await axios.post<{ success: boolean; urls: string[]; message?: string }>(getApiUrl("/api/upload_images.php"), fd, { withCredentials: true });
      if (!res.data.success) throw new Error(res.data.message);
      setMainImage(res.data.urls[0]);
    } catch (err) {
      alert((err as Error).message || "Main image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const fd = new FormData();
    files.forEach(f => fd.append("thumbnails[]", f));
    try {
      setIsUploading(true);
      const res = await axios.post<{ success: boolean; urls: string[]; message?: string }>(getApiUrl("/api/upload_images.php"), fd, { withCredentials: true });
      if (!res.data.success) throw new Error(res.data.message);
      setThumbnails(res.data.urls);
    } catch (err) {
      alert((err as Error).message || "Thumbnail upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Final submit to create product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !category.trim() || !description.trim() || price <= 0 || quantity < 0 || !mainImage) {
      alert("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    const payload = { name, brand, category, description, status: visibility, price, quantity,revenue: price * quantity,
  rating: 0, main_image_url: mainImage, thumbnails };
    try {
      const res = await axios.post<{ success: boolean; message?: string }>(getApiUrl("/api/addproduct.php"), payload);
      if (!res.data.success) throw new Error(res.data.message);
      await onProductAdded(payload);
      onClose();
    } catch (err) {
      alert((err as Error).message || "Could not save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit} className={styles.container}>
          {/* Left Panel – Product Details */}
          <div className={styles.leftPanel}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Product Details</h2>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>Product Name*</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="brand" className={styles.label}>Brand</label>
                <input id="brand" type="text" value={brand} onChange={e => setBrand(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="category" className={styles.label}>Category*</label>
                <select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="price" className={styles.label}>Price* (Ksh)</label>
                <input id="price" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(+e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="quantity" className={styles.label}>Quantity*</label>
                <input id="quantity" type="number" min="0" value={quantity} onChange={e => setQuantity(+e.target.value)} required />
              </div>
              <div className={styles.field}>
                <label htmlFor="visibility" className={styles.label}>Status</label>
                <select id="visibility" value={visibility} onChange={e => setVisibility(e.target.value as any)}>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Panel – Description & Images */}
          <div className={styles.rightPanelContainer}>
            <div className={styles.rightPanel}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product Description</h2>
                <div className={styles.field}>
                  <label htmlFor="description" className={styles.label}>Description*</label>
                  <textarea id="description" rows={6} value={description} onChange={e => setDescription(e.target.value)} required className={styles.descriptionTextarea} />
                </div>
              </div>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product Images</h2>
                <div className={styles.imageUpload}>
                  <label className={styles.label}>Main Image*</label>
                  <input type="file" accept="image/*" onChange={handleMainImageUpload} disabled={isUploading} required />
                </div>
                <div className={styles.thumbnailUpload}>
                  <label className={styles.label}>Additional Thumbnails</label>
                  <input type="file" accept="image/*" multiple onChange={handleThumbnailUpload} disabled={isUploading || thumbnails.length >= 5} />
                </div>

                {/* Previews */}
                <div className={styles.thumbnailGrid}>
                  {mainImage && (
                    <div className={styles.thumbnailContainer}>
                      <img src={`${process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/?public\/?$/i, "") || 'https://api.sunleaftechnologies.co.ke'}/public/${mainImage}`} alt="Main" className={styles.thumbnail} />
                      <button type="button" className={styles.removeThumbnailButton} onClick={() => setMainImage(null)} disabled={isUploading}>×</button>
                    </div>
                  )}
                  {thumbnails.map((url, i) => (
                    <div key={i} className={styles.thumbnailContainer}>
                      <img src={`${process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/?public\/?$/i, "") || 'https://api.sunleaftechnologies.co.ke'}/public/${url}`} alt={`Thumb ${i}`} className={styles.thumbnail} />
                      <button type="button" className={styles.removeThumbnailButton} onClick={() => setThumbnails(prev => prev.filter((_, idx) => idx !== i))} disabled={isUploading}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting || isUploading}>Cancel</button>
              <button type="submit" className={styles.saveButton} disabled={isSubmitting || isUploading}>{isSubmitting ? "Saving…" : "Save Product"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;