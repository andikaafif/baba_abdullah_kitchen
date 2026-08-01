import type { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: 'kukus-original',
    name: 'Kukus Original',
    category: 'Kukus',
    description:
      'Dimsum kukus original dengan isian daging pilihan yang lembut dan gurih. Dibuat dari bahan-bahan segar pilihan tanpa MSG.',
    variants: [
      { label: 'Small', pcs: '5 pcs', price: 25000 },
      { label: 'Regular', pcs: '6 pcs', price: 28000 },
      { label: 'Medium', pcs: '10 pcs', price: 43000 },
      { label: 'Family Pack', pcs: '12 pcs', price: 58000 },
    ],
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop',
  },
  {
    id: 'mentai-regular',
    name: 'Mentai Regular',
    category: 'Mentai',
    description:
      'Dimsum dengan saus mentai creamy yang kaya rasa, dibakar sempurna hingga kecoklatan.',
    variants: [
      { label: 'Medium', pcs: '6 pcs', price: 34000 },
      { label: 'Family Pack', pcs: '12 pcs', price: 60000 },
    ],
    image: 'https://images.unsplash.com/photo-1582482067920-f30e1f5ea75c?w=400&h=300&fit=crop',
  },
  {
    id: 'mentai-mix-original',
    name: 'Mentai Mix Original',
    category: 'Mentai',
    description:
      'Perpaduan sempurna dimsum original dengan topping mentai yang creamy dan lezat.',
    variants: [
      { label: 'Medium', pcs: '6 pcs', price: 45000 },
      { label: 'Family Pack', pcs: '12 pcs', price: 58000 },
    ],
    image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=300&fit=crop',
  },
  {
    id: 'cheese-cheddar',
    name: 'Cheese Cheddar',
    category: 'Cheese',
    description:
      'Dimsum dengan lelehan keju cheddar premium yang gurih dan creamy di setiap gigitannya.',
    variants: [
      { label: 'Small', pcs: '4 pcs', price: 31000 },
      { label: 'Medium', pcs: '6 pcs', price: 40000 },
      { label: 'Family Pack', pcs: '12 pcs', price: 63000 },
    ],
    image: 'https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=400&h=300&fit=crop',
  },
  {
    id: 'cheese-cheddar-mix-mentai',
    name: 'Cheese Cheddar Mix Mentai',
    category: 'Cheese',
    description:
      'Kombinasi istimewa keju cheddar dan mentai yang menciptakan cita rasa premium yang tak tertandingi.',
    variants: [
      { label: 'Medium', pcs: '6 pcs', price: 45000 },
      { label: 'Family Pack', pcs: '12 pcs', price: 65000 },
    ],
    image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=400&h=300&fit=crop',
  },
  {
    id: 'frozen',
    name: 'Frozen',
    category: 'Frozen',
    description: 'Dimsum beku siap masak untuk stok di rumah. Praktis dan tetap lezat kapan saja.',
    variants: [
      { label: '10 pcs', pcs: '10 pcs', price: 44000 },
      { label: '20 pcs', pcs: '20 pcs', price: 80000 },
    ],
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop',
  },
];

export const featuredMenuIds = ['kukus-original', 'mentai-regular', 'cheese-cheddar', 'frozen'];
