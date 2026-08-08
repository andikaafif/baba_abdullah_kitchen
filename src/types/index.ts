export interface MenuVariant {
  label: string;
  pcs: string;
  price: number;
}

export type MenuCategory = 'Kukus' | 'Mentai' | 'Cheese' | 'Frozen' | 'Birthday';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  variants: MenuVariant[];
  image: string;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  category: MenuCategory;
  variant: MenuVariant;
  quantity: number;
  image: string;
}

export type DeliveryMethod = 'Pickup' | 'Delivery';
export type PaymentMethod = 'Cash' | 'Transfer' | 'QRIS';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
  deliveryMethod: DeliveryMethod;
  deliveryArea?: string;
  paymentMethod: PaymentMethod;
}

export interface Order {
  orderNumber: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  totalPrice: number;
  createdAt: Date;
}
