import React, { useState, useEffect } from "react";
import axios from 'axios';
import styles from "../styles/CreateProduct.module.css";

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
  id: number;
  name: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
  status: string;
  revenue: number;
  rating: number;
  main_image_url?: string;
  thumbnails?: string[];
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onProductUpdated: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onProductUpdated }) => {
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand || "");
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const initialStock = product.stock_quantity ?? product.quantity;
  const [quantity, setQuantity] = useState(initialStock);
  const [status, setStatus] = useState(product.status);
  const [mainImage, setMainImage] = useState<string | null>(product.main_image_url || null);
  const [thumbnails, setThumbnails] = useState<string[]>(product.thumbnails || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("main_image", file);
    try {
      setIsUploading(true);
      const res = await axios.post<{ success: boolean; urls: string[]; message?: string }>(
        "/api/upload_images.php", 
        fd
      );
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
      const res = await axios.post<{ success: boolean; urls: string[]; message?: string }>(
        "/api/upload_images.php", 
        fd
      );
      if (!res.data.success) throw new Error(res.data.message);
      setThumbnails(prev => [...prev, ...res.data.urls]);
    } catch (err) {
      alert((err as Error).message || "Thumbnail upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !description.trim() || price <= 0 || quantity < 0) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const payload: Product = {
      id: product.id,
      name,
      brand,
      category,
      description,
      status,
      price,
      quantity,
      stock_quantity: quantity,
      revenue: price * quantity,
      rating: product.rating,
      main_image_url: mainImage || undefined,
      thumbnails
    };

    try {
      const res = await axios.post<{ success: boolean; message?: string }>(
        "/api/updateProduct.php", 
        payload
      );
      if (!res.data.success) throw new Error(res.data.message);
      onProductUpdated({ ...product, ...payload });
      onClose();
    } catch (err) {
      alert((err as Error).message || "Could not update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className={styles.container}>
          <div className={styles.leftPanel}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Edit Product Details</h2>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>Product Name*</label>
                <input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="brand" className={styles.label}>Brand</label>
                <input 
                  id="brand" 
                  type="text" 
                  value={brand} 
                  onChange={e => setBrand(e.target.value)} 
                />
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
                <input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={price} 
                  onChange={e => setPrice(+e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="quantity" className={styles.label}>Quantity*</label>
                <input 
                  id="quantity" 
                  type="number" 
                  min="0" 
                  value={quantity} 
                  onChange={e => setQuantity(+e.target.value)} 
                  required 
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="status" className={styles.label}>Status</label>
                <select 
                  id="status" 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="Stock OK">Stock OK</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Reorder">Reorder</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.rightPanelContainer}>
            <div className={styles.rightPanel}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product Description</h2>
                <div className={styles.field}>
                  <label htmlFor="description" className={styles.label}>Description*</label>
                  <textarea 
                    id="description" 
                    rows={6} 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    required 
                    className={styles.descriptionTextarea} 
                  />
                </div>
              </div>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Product Images</h2>
                <div className={styles.imageUpload}>
                  <label className={styles.label}>Main Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleMainImageUpload} 
                    disabled={isUploading} 
                  />
                </div>
                <div className={styles.thumbnailUpload}>
                  <label className={styles.label}>Additional Thumbnails</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleThumbnailUpload} 
                    disabled={isUploading || thumbnails.length >= 5} 
                  />
                </div>

                <div className={styles.thumbnailGrid}>
                  {mainImage && (
                    <div className={styles.thumbnailContainer}>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${mainImage}`} 
                        alt="Main" 
                        className={styles.thumbnail} 
                      />
                      <button 
                        type="button" 
                        className={styles.removeThumbnailButton} 
                        onClick={() => setMainImage(null)} 
                        disabled={isUploading}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {thumbnails.map((url, i) => (
                    <div key={i} className={styles.thumbnailContainer}>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`} 
                        alt={`Thumb ${i}`} 
                        className={styles.thumbnail} 
                      />
                      <button 
                        type="button" 
                        className={styles.removeThumbnailButton} 
                        onClick={() => setThumbnails(prev => prev.filter((_, idx) => idx !== i))} 
                        disabled={isUploading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={onClose} 
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.saveButton} 
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? "Updating…" : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
