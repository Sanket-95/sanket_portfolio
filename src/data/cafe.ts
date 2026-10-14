/** Mock data for the café order-management app demo (/mobile-app-demo). Front-end only — nothing is persisted. */
export type MenuCategory = 'Coffee' | 'Tea' | 'Bakery' | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  /** Emoji used as the item photo. */
  emoji: string;
  veg: boolean;
}

export const menuCategories: MenuCategory[] = ['Coffee', 'Tea', 'Bakery', 'Desserts'];

export const menu: MenuItem[] = [
  { id: 'm1', name: 'Cappuccino', category: 'Coffee', price: 180, emoji: '☕', veg: true },
  { id: 'm2', name: 'Café Latte', category: 'Coffee', price: 200, emoji: '🥛', veg: true },
  { id: 'm3', name: 'Cold Brew', category: 'Coffee', price: 220, emoji: '🧊', veg: true },
  { id: 'm4', name: 'Espresso', category: 'Coffee', price: 140, emoji: '☕', veg: true },
  { id: 'm5', name: 'Masala Chai', category: 'Tea', price: 90, emoji: '🫖', veg: true },
  { id: 'm6', name: 'Iced Lemon Tea', category: 'Tea', price: 130, emoji: '🍋', veg: true },
  { id: 'm7', name: 'Matcha Latte', category: 'Tea', price: 240, emoji: '🍵', veg: true },
  { id: 'm8', name: 'Butter Croissant', category: 'Bakery', price: 150, emoji: '🥐', veg: true },
  { id: 'm9', name: 'Chicken Sandwich', category: 'Bakery', price: 210, emoji: '🥪', veg: false },
  { id: 'm10', name: 'Veg Puff', category: 'Bakery', price: 70, emoji: '🥟', veg: true },
  { id: 'm11', name: 'Chocolate Brownie', category: 'Desserts', price: 160, emoji: '🍫', veg: true },
  { id: 'm12', name: 'Blueberry Cheesecake', category: 'Desserts', price: 260, emoji: '🍰', veg: true },
];

export type OrderStatus = 'New' | 'Preparing' | 'Ready' | 'Served';
export const orderFlow: OrderStatus[] = ['New', 'Preparing', 'Ready', 'Served'];

export interface Order {
  id: number;
  table: string;
  items: { itemId: string; qty: number }[];
  status: OrderStatus;
  /** Display time; fixed for seeded orders so pre-rendered HTML matches the client. */
  time: string;
}

export const tables = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'Takeaway'];

export const seedOrders: Order[] = [
  { id: 1041, table: 'T3', items: [{ itemId: 'm1', qty: 2 }, { itemId: 'm8', qty: 2 }], status: 'Preparing', time: '9:42 AM' },
  { id: 1042, table: 'Takeaway', items: [{ itemId: 'm3', qty: 1 }], status: 'Ready', time: '9:48 AM' },
  { id: 1043, table: 'T1', items: [{ itemId: 'm5', qty: 3 }, { itemId: 'm10', qty: 3 }], status: 'New', time: '9:55 AM' },
  { id: 1040, table: 'T5', items: [{ itemId: 'm7', qty: 1 }, { itemId: 'm12', qty: 1 }], status: 'Served', time: '9:30 AM' },
  { id: 1039, table: 'T2', items: [{ itemId: 'm2', qty: 2 }, { itemId: 'm11', qty: 1 }], status: 'Served', time: '9:12 AM' },
];

/** Sales already booked earlier today (before the seeded orders), for the dashboard. */
export const earlierSales = { revenue: 8420, orders: 38 };

export const itemById = (id: string) => menu.find((m) => m.id === id)!;
export const orderTotal = (o: Pick<Order, 'items'>) => o.items.reduce((n, l) => n + itemById(l.itemId).price * l.qty, 0);
