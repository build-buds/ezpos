export type BusinessCategory = 'warung' | 'restoran' | 'onlineshop';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  address?: string;
  phone: string;
  photo?: string;
  settings: Record<string, unknown>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  image?: string;
  category: string;
  stock: number;
  minStock?: number;
  hasModifier?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  modifiers?: string[];
  note?: string;
  subtotal: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  discount: number;
  paymentMethod: 'cash' | 'transfer' | 'bayar_nanti';
  orderType?: 'dine_in' | 'take_away' | 'delivery' | 'online';
  tableNumber?: number;
  status: 'completed' | 'active' | 'voided';
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export interface DashboardWidget {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  action?: string;
  trend?: 'up' | 'down' | 'neutral';
}
