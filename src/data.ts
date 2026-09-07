export type Category = "all" | "car" | "motorcycle" | "diesel" | "industrial";

export type Product = {
  id: string;
  name: string;
  grade: string;
  category: Category;
  image: string;
  bullets: string[];
  price: number;
  pack: string;
  tag?: string;
};

export const CATS: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "All Products", icon: "grid" },
  { id: "car", label: "Car Oils", icon: "car" },
  { id: "motorcycle", label: "Motorcycle", icon: "bike" },
  { id: "diesel", label: "Diesel", icon: "truck" },
  { id: "industrial", label: "Industrial", icon: "gear" },
];

export const PRODUCTS: Product[] = [
  {
    id: "carient",
    name: "Carient Ultra Synthetic",
    grade: "SAE 5W-40 · API SN",
    category: "car",
    image: "/images/pro-carient.jpg",
    bullets: [
      "Fully synthetic for petrol & hybrid cars",
      "Superior wear protection & fuel economy",
      "Excellent cold-start performance",
    ],
    price: 9800,
    pack: "4 Litre",
    tag: "BEST SELLER",
  },
  {
    id: "blaze",
    name: "Blaze 4T Racing",
    grade: "SAE 20W-50 · API SL / JASO MA2",
    category: "motorcycle",
    image: "/images/pro-blaze.jpg",
    bullets: [
      "For 4-stroke motorcycles & rickshaws",
      "Smooth clutch performance",
      "Protects at high RPM & temperature",
    ],
    price: 1450,
    pack: "1 Litre",
    tag: "NEW",
  },
  {
    id: "deo",
    name: "DEO Heavy Duty",
    grade: "SAE 15W-40 · API CI-4",
    category: "diesel",
    image: "/images/pro-deo.jpg",
    bullets: [
      "For trucks, buses & generators",
      "Extended drain intervals",
      "Soot control & TBN retention",
    ],
    price: 18500,
    pack: "10 Litre",
  },
  {
    id: "gear",
    name: "Gear & Grease Pro",
    grade: "SAE 85W-140 · GL-5 / EP-2",
    category: "industrial",
    image: "/images/pro-gear.jpg",
    bullets: [
      "Gear oils, hydraulic oils & greases",
      "Heavy load & shock protection",
      "For industry & agriculture",
    ],
    price: 3200,
    pack: "4 kg / 4 L",
  },
];

/* ---------- oil finder ---------- */
export const VEHICLES = [
  { id: "car", label: "Car / SUV", icon: "car" },
  { id: "bike", label: "Motorcycle", icon: "bike" },
  { id: "truck", label: "Truck / Bus", icon: "truck" },
  { id: "agri", label: "Tractor / Agri", icon: "tractor" },
];

export const DRIVE_STYLES = [
  { id: "city", label: "City driving" },
  { id: "highway", label: "Highway / long routes" },
  { id: "heavy", label: "Heavy load / commercial" },
];

export const FINDER_RESULT: Record<string, string> = {
  "car-city": "Carient Ultra Synthetic 5W-40",
  "car-highway": "Carient Ultra Synthetic 5W-40",
  "car-heavy": "DEO Heavy Duty 15W-40",
  "bike-city": "Blaze 4T Racing 20W-50",
  "bike-highway": "Blaze 4T Racing 20W-50",
  "bike-heavy": "Blaze 4T Racing 20W-50",
  "truck-city": "DEO Heavy Duty 15W-40",
  "truck-highway": "DEO Heavy Duty 15W-40",
  "truck-heavy": "DEO Heavy Duty 15W-40",
  "agri-city": "Gear & Grease Pro 85W-140",
  "agri-highway": "Gear & Grease Pro 85W-140",
  "agri-heavy": "Gear & Grease Pro 85W-140",
};

/* ---------- why choose us ---------- */
export const FEATURES = [
  {
    icon: "flask",
    title: "Lab-tested formulas",
    copy: "Every batch passes 20+ quality tests in our state-of-the-art laboratories before it reaches the shelf.",
  },
  {
    icon: "thermo",
    title: "Built for extreme heat",
    copy: "Engineered for 50°C summers, dusty roads and heavy traffic — conditions our engines actually face.",
  },
  {
    icon: "shield",
    title: "API & JASO certified",
    copy: "International certifications guarantee performance that matches or beats imported brands.",
  },
  {
    icon: "recycle",
    title: "Longer drain intervals",
    copy: "Advanced additive packages keep oil stable longer — fewer changes, lower running costs.",
  },
];

/* ---------- contact ---------- */
export const CONTACT_INFO = {
  uan: "+923077885585",
  email: "psolubricants.pk@gmail.com",
  hq: "Qaiser filling station, Khanewal",
};

/** Opens Google Maps centred on the exact head-office location. */
export const HQ_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Qaiser filling station, Khanewal, Punjab, Pakistan",
)}`;

export const AUTH = {
  email: "psolubricants.pk@gmail.com",
  password: "qasim084&",
};

/* ---------- delivery ---------- */
export const DELIVERY_ZONES = [
  { id: "local", label: "Khanewal (local) — Free", fee: 0, days: "1-2" },
  { id: "spunjab", label: "South & Central Punjab — from Rs. 450", fee: 900, days: "2-4" },
  { id: "sindh", label: "Sindh & Karachi — from Rs. 700", fee: 800, days: "3-4" },
  { id: "north", label: "Northern & NWFP — from Rs. 600", fee: 1000, days: "3-5" },
  { id: "balochistan", label: "Balochistan — from Rs. 1,000", fee: 1200, days: "4-6" },
];

export const TRACKING_STATUSES = [
  { id: "pending", label: "Payment being verified", color: "text-amber" },
  { id: "accepted", label: "Payment approved — packing", color: "text-oil" },
  { id: "processing", label: "Packed & handed to courier", color: "text-oil" },
  { id: "in-transit", label: "In transit to your city", color: "text-moss" },
  { id: "out-for-delivery", label: "Out for delivery", color: "text-oil" },
  { id: "delivered", label: "Delivered", color: "text-moss" },
];

export const DECLINED_STATUS = { id: "declined", label: "Payment not received — order declined", color: "text-rust" };

export const INTERESTS = [
  "Becoming a dealer / distributor",
  "Bulk order for fleet",
  "Finding the right oil",
  "Private-label blending",
  "Other",
];
