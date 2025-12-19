export interface ProductImageSet {
  main: string;
  thumbnails: string[];
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  category: string;
  price: number;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  imageSet: ProductImageSet;
  features: string[];
  specifications: Record<string, string>;
}
