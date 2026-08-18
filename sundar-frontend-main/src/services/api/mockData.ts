export const mockProducts = [
  {
    _id: 'prod_1',
    id: 'prod_1',
    name: '50 Kg HDPE Plain Bag',
    slug: '50-kg-hdpe-plain-bag',
    description: 'Durable 50 Kg HDPE plain bag suitable for agriculture and industrial packaging.',
    category: 'HDPE Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1605335198944-6725287e02df?auto=format&fit=crop&q=80',
    images: [],
    price: 25,
    minPrice: 13,
    maxPrice: 25,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    sizeOptions: [
      { size: '50 Kg', price_100_percent: 25, price_50_percent: 13, availability: true, stock: 1000 }
    ],
    bagSize: '22x36 inches',
    weight: '100g',
    printType: 'Plain',
    closure: 'Heat Sealed'
  },
  {
    _id: 'prod_2',
    id: 'prod_2',
    name: '25 Kg HDPE Printed Bag',
    slug: '25-kg-hdpe-printed-bag',
    description: 'Customizable 25 Kg HDPE printed bag for retail and wholesale products.',
    category: 'HDPE Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1605335198944-6725287e02df?auto=format&fit=crop&q=80',
    images: [],
    price: 15,
    minPrice: 8,
    maxPrice: 15,
    rating: 4.5,
    reviews: 89,
    inStock: true,
    sizeOptions: [
      { size: '25 Kg', price_100_percent: 15, price_50_percent: 8, availability: true, stock: 800 }
    ],
    bagSize: '18x28 inches',
    weight: '60g',
    printType: 'Printed',
    closure: 'Hemmed'
  },
  {
    _id: 'prod_3',
    id: 'prod_3',
    name: '50 Kg PP Wheat Bag',
    slug: '50-kg-pp-wheat-bag',
    description: 'Premium quality PP woven sack designed specifically for wheat packaging.',
    category: 'PP Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80',
    images: [],
    price: 18,
    minPrice: 9,
    maxPrice: 18,
    rating: 4.9,
    reviews: 210,
    inStock: true,
    sizeOptions: [
      { size: '50 Kg', price_100_percent: 18, price_50_percent: 9, availability: true, stock: 1500 }
    ],
    bagSize: '22x40 inches',
    weight: '80g',
    printType: 'Flexo Print',
    closure: 'Stitched'
  },
  {
    _id: 'prod_4',
    id: 'prod_4',
    name: 'PP Wall Putty Bag',
    slug: 'pp-wall-putty-bag',
    description: 'Laminated PP bags perfect for wall putty and construction materials.',
    category: 'PP Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&q=80',
    images: [],
    price: 22,
    minPrice: 11,
    maxPrice: 22,
    rating: 4.6,
    reviews: 156,
    inStock: true,
    sizeOptions: [
      { size: '40 Kg', price_100_percent: 22, price_50_percent: 11, availability: true, stock: 1200 }
    ],
    bagSize: '20x30 inches',
    weight: '70g',
    printType: 'Laminated Print',
    closure: 'Valve'
  },
  {
    _id: 'prod_5',
    id: 'prod_5',
    name: 'BOPP Woven Sack Bag',
    slug: 'bopp-woven-sack-bag',
    description: 'High-quality BOPP laminated woven sack for premium product presentation.',
    category: 'BOPP Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80',
    images: [],
    price: 30,
    minPrice: 15,
    maxPrice: 30,
    rating: 4.7,
    reviews: 95,
    inStock: true,
    sizeOptions: [
      { size: '25 Kg', price_100_percent: 30, price_50_percent: 15, availability: true, stock: 500 }
    ],
    specifications: {
      "Capacity": "30 kg",
      "Color": "Blue",
      "Material": "BOPP Woven",
      "Shape": "Rectangular",
      "Usage/Application": "Packaging",
      "Is It Waterproof": "Waterproof",
      "Bag Size": "19x32 Inch",
      "Is It Laminated": "Laminated"
    },
    bagSize: '18x26 inches',
    weight: '90g',
    printType: 'Rotogravure',
    closure: 'Double Stitched'
  },
  {
    _id: 'prod_6',
    id: 'prod_6',
    name: 'FIBC Jumbo Bulk Bag',
    slug: 'fibc-jumbo-bulk-bag',
    description: '1 Ton capacity Flexible Intermediate Bulk Container for heavy duty transport.',
    category: 'Polypropylene Bulk Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&q=80',
    images: [],
    price: 350,
    minPrice: 180,
    maxPrice: 350,
    rating: 4.9,
    reviews: 320,
    inStock: true,
    sizeOptions: [
      { size: '1 Ton', price_100_percent: 350, price_50_percent: 180, availability: true, stock: 200 }
    ],
    bagSize: '90x90x100 cm',
    weight: '1.5Kg',
    printType: 'Plain',
    closure: 'Spout Top/Bottom'
  },
  {
    _id: 'prod_7',
    id: 'prod_7',
    name: 'Standard Jute Gunny Bag',
    slug: 'standard-jute-gunny-bag',
    description: 'Traditional eco-friendly jute gunny bag for food grains and potatoes.',
    category: 'Jute Bags',
    brand: 'Sundar Corporation',
    image: 'https://images.unsplash.com/photo-1592636306606-d9b8b0e7d58a?auto=format&fit=crop&q=80',
    images: [],
    price: 45,
    minPrice: 23,
    maxPrice: 45,
    rating: 4.4,
    reviews: 67,
    inStock: true,
    sizeOptions: [
      { size: '50 Kg', price_100_percent: 45, price_50_percent: 23, availability: true, stock: 300 }
    ],
    bagSize: '44x26.5 inches',
    weight: '900g',
    printType: 'Plain/Striped',
    closure: 'Open Mouth'
  }
];

export const mockCategories = [
  { _id: 'cat_1', id: 'cat_1', name: 'HDPE Bags', slug: 'hdpe', icon: 'Layers', description: 'High Density Polyethylene Bags for industrial use.' },
  { _id: 'cat_2', id: 'cat_2', name: 'PP Bags', slug: 'pp', icon: 'Settings', description: 'Polypropylene Woven Sacks for durable packaging.' },
  { _id: 'cat_3', id: 'cat_3', name: 'BOPP Bags', slug: 'bopp', icon: 'Sliders', description: 'Biaxially Oriented Polypropylene Bags with excellent printing capabilities.' },
  { _id: 'cat_4', id: 'cat_4', name: 'Polypropylene Bulk Bags', slug: 'bulk', icon: 'Shield', description: 'Jumbo bags for bulk material transportation and storage.' },
  { _id: 'cat_5', id: 'cat_5', name: 'Jute Bags', slug: 'jute', icon: 'Package', description: 'Eco-friendly and traditional packaging solutions.' }
];
