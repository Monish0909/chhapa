export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  category: string;
  craftDetails?: string;
  inStock: boolean;
  featured?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
  customerEmail: string;
  paymentMethod?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  savedAddresses?: Address[];
  role?: 'customer' | 'admin';
}
