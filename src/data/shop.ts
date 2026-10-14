/** Dummy catalogue for the e-commerce demo (/ecommerce-demo). */
export type ShopCategory = 'Audio' | 'Wearables' | 'Fashion' | 'Home';

export interface Product {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  /** Original price when the item is on sale. */
  mrp?: number;
  rating: number;
  reviews: number;
  /** lucide icon name, drawn on a gradient tile in place of a photo. */
  icon: 'headphones' | 'speaker' | 'earbuds' | 'watch' | 'glasses' | 'fitness' | 'shirt' | 'shoe' | 'backpack' | 'lamp' | 'coffee' | 'plant';
  tint: string;
  badge?: string;
}

export const shopCategories: ShopCategory[] = ['Audio', 'Wearables', 'Fashion', 'Home'];

export const products: Product[] = [
  { id: 'p1', name: 'Aura Wireless Headphones', category: 'Audio', price: 4999, mrp: 7999, rating: 4.6, reviews: 1284, icon: 'headphones', tint: 'from-[#c7d2fe] to-[#a5b4fc]', badge: 'Bestseller' },
  { id: 'p2', name: 'Pulse Bluetooth Speaker', category: 'Audio', price: 2499, rating: 4.4, reviews: 642, icon: 'speaker', tint: 'from-[#fecaca] to-[#fca5a5]' },
  { id: 'p3', name: 'Echo Buds Pro', category: 'Audio', price: 3299, mrp: 4499, rating: 4.3, reviews: 903, icon: 'earbuds', tint: 'from-[#e9d5ff] to-[#d8b4fe]' },
  { id: 'p4', name: 'Orbit Smart Watch', category: 'Wearables', price: 6499, mrp: 8999, rating: 4.5, reviews: 2210, icon: 'watch', tint: 'from-[#bae6fd] to-[#7dd3fc]', badge: '28% off' },
  { id: 'p5', name: 'Stride Fitness Band', category: 'Wearables', price: 1799, rating: 4.1, reviews: 455, icon: 'fitness', tint: 'from-[#bbf7d0] to-[#86efac]' },
  { id: 'p6', name: 'Clearview Blue-Light Glasses', category: 'Wearables', price: 1199, rating: 4.2, reviews: 318, icon: 'glasses', tint: 'from-[#fde68a] to-[#fcd34d]' },
  { id: 'p7', name: 'Everyday Cotton Tee', category: 'Fashion', price: 699, mrp: 999, rating: 4.4, reviews: 1532, icon: 'shirt', tint: 'from-[#fbcfe8] to-[#f9a8d4]' },
  { id: 'p8', name: 'Cloudstep Running Shoes', category: 'Fashion', price: 3499, rating: 4.7, reviews: 876, icon: 'shoe', tint: 'from-[#fed7aa] to-[#fdba74]', badge: 'New' },
  { id: 'p9', name: 'Commuter Laptop Backpack', category: 'Fashion', price: 1899, mrp: 2499, rating: 4.5, reviews: 690, icon: 'backpack', tint: 'from-[#cbd5e1] to-[#94a3b8]' },
  { id: 'p10', name: 'Halo Desk Lamp', category: 'Home', price: 1499, rating: 4.3, reviews: 287, icon: 'lamp', tint: 'from-[#fef08a] to-[#fde047]' },
  { id: 'p11', name: 'Barista Ceramic Mug Set', category: 'Home', price: 899, rating: 4.6, reviews: 412, icon: 'coffee', tint: 'from-[#d6d3d1] to-[#a8a29e]' },
  { id: 'p12', name: 'Monstera Indoor Plant', category: 'Home', price: 799, mrp: 1099, rating: 4.4, reviews: 233, icon: 'plant', tint: 'from-[#a7f3d0] to-[#6ee7b7]' },
];

export const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;
