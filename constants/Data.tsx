import { MdOutlineLocalShipping } from "react-icons/md";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { CiLock } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { BsShopWindow } from "react-icons/bs";
import {BsTelephone} from "react-icons/bs"

export const slides = [  
  { id: 1, image: "/home.png" },
  { id: 2, image: "/home.png" },
  { id: 3, image: "/home.png" },
];

export const CURRENCY = {
  locale: "en-US",
  code: "USD",
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
  }).format(amount);

export const features = [
    { icon: <MdOutlineLocalShipping />, title: "Free Shipping", des: `Order above ${formatCurrency(200)}`},
    { icon: <LiaMoneyBillSolid />, title: "Money-back", des: "30 days guarantee" },
    { icon: <CiLock />, title: "Secure Payments", des: "Secured by Stripe" },
    { icon: <IoCallOutline />, title: "24/7 Support", des: "Phone and Email support" },
  ];

export const articles = [
  { id: 1, image: "/blog/a1.png", title: "7 ways to decor your home", date:"October 16, 2023", description:'3', type: "blog" },
  { id: 2, image: "/blog/a2.png", title: "Kitchen organization", date:"October 16, 2023",description:'3', type: "features" },
  { id: 3, image: "/blog/a3.png", title: "Decor your bedroom",date:"October 16, 2023", description:'3', type: "blog" },
  { id: 4, image: "/blog/a4.png", title: "Modern texas home is beautiful and completely kid-friendly", date:"October 16, 2023",description:'3', type: "blog" },
  { id: 5, image: "/blog/a5.png", title: "Kitchen organization",date:"October 16, 2023", description:'3', type: "features" },
  { id: 6, image: "/blog/a6.png", title: "Decor your bedroom", date:"October 16, 2023",description:'3', type: "blog" },
  { id: 7, image: "/blog/a7.png", title: "7 ways to decor your home", date:"October 16, 2023",description:'3', type: "blog" },
  { id: 8, image: "/blog/a8.png", title: "Kitchen organization",date:"October 16, 2023", description:'3', type: "features" },
  { id: 9, image: "/blog/a9.png", title: "Decor your bedroom", date:"October 16, 2023",description:'3', type: "blog" },
]
export const contact = [
    { icon: <BsShopWindow />, title: "Address", des: "234 Hai Trieu, Ho Chi Minh City, Viet Nam" },
    { icon: <BsTelephone/>, title: "Contact Us", des: "+84 234 567 890" },
    { icon: <MdOutlineMailOutline />, title: "Email", des: "hello@3legant.com" },
  ];

export type ProductType = {
  id: number
  name: string
  price: number
  oldPrice: number
  image: string
  validationTill:string
  description: string
  category: string
  color: string
  measurements: string
  isNew?: boolean
  thumbnails?: {
    t1?: string
    t2?: string
    t3?: string
  }
}
// export const products = [
//   {
//     id: 11,
//     name: "Loveseat Sofa",
//     price: 25.0,
//     oldPrice: 100.0,
//     image: "/products/P1.png",
//     isNew: true,
//     category: "Living Room",
//     color: "black",
//     measurements: "17 1/2x20 5/8",
//     description:
//       "Buy one or buy a few and make every space where you sit more convenient. Light and easy to move around with removable tray top. Perfect for cozy evenings with loved ones and fits seamlessly into any living space.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 12,
//     name: "Luxury Sofa",
//     price: 299,
//     oldPrice: 500,
//     image: "/products/P2.png",
//     isNew: true,
//     category: "Kitchen",
//     color: "red",
//     measurements: "18 3/4x22 1/4",
//     description:
//       "Add a pop of color to your kitchen nook with this vibrant red loveseat. Ideal for casual breakfast chats or quick family huddles. Stain-resistant fabric makes cleanup a breeze and enhances the warmth of any kitchen space.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
// {
//     id: 13,
//     name: "Table Lamp",
//     price: 199.0,
//     oldPrice: 400.0,
//     image: "/products/P3.png",
//     isNew: true,
//     category: "Living Room",
//     color: "black",
//     measurements: "19 1/2x21 1/2",
//     description:
//       "Elevate your lounge area with this elegant black loveseat. Deep cushions provide ultimate comfort, while the minimalist frame complements modern decor effortlessly. A perfect choice for reading, relaxing, or entertaining guests.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 14,
//     name: "White Drawer unit",
//     price: 499.0,
//     oldPrice: 799.0,
//     image: "/products/P4.png",
//     isNew: true,
//     category: "Living Room",
//     color: "pink",
//     measurements: "6 1/2x12 3/8",
//     description:
//       "Illuminate your evenings with a touch of whimsy. This pink table lamp features a soft glow and adjustable height, making it a charming addition to side tables, nightstands, or study desks. Perfect for reading or creating cozy ambiance.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 15,
//     name: "Beige Table Lamp",
//     price: 358.87,
//     oldPrice: 699.0,
//     image: "/products/P5.png",
//     isNew: true,
//     category: "Living Room",
//     color: "blue",
//     measurements: "5 1/2x11 1/4",
//     description:
//       "Sophisticated and serene, this beige table lamp with blue accents casts a warm, inviting light. Perfect for reading corners or as a subtle accent in relaxed living spaces. Adds elegance and functionality to any table.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 16,
//     name: "Lamp",
//     price: 39.0,
//     oldPrice: 50.0,
//     image: "/products/P66.png",
//     isNew: true,
//     category: "Kitchen",
//     color: "blue",
//     measurements: "12 3/8x15 1/2",
//     description:
//       "Eco-friendly organization meets style in this blue-tinted bamboo basket. Store fruits, veggies, or linens with ease. Lightweight, durable, and natural, perfect for kitchen or dining area storage while adding a rustic charm.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 17,
//     name: "Light Beige Pillow",
//     price: 3.99,
//     oldPrice: 5,
//     image: "/products/P7.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "red",
//     measurements: "20 1/4x24 1/2",
//     description:
//       "Unwind in luxury with this red comfort sofa for your bedroom retreat. Extra-deep seats and memory foam ensure restorative relaxation. Its elegant design makes it the perfect centerpiece for comfort and style.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 18,
//     name: "Table Lamp",
//     price: 39.99,
//     oldPrice: 49.99,
//     image: "/products/P8.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "black",
//     measurements: "21 1/2x25 3/8",
//     description:
//       "Sleek black comfort sofa that blends into any room's aesthetic. High-density foam cushions offer superior support, ideal for movie nights, quiet reflection, or social gatherings. Perfect combination of style and comfort.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 19,
//     name: "Bamboo Basket",
//     price: 9.99,
//     oldPrice: 12.34,
//     image: "/products/P9.png",
//     isNew: true,
//     category: "Outdoor",
//     color: "green",
//     measurements: "18 1/2x18 3/4",
//     description:
//       "Comfortable green outdoor chair for patios or gardens. Durable weather-resistant material and easy-to-clean surface make it ideal for outdoor lounging.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 20,
//     name: "Cozy Sofa",
//     price: 499.0,
//     oldPrice: 999.0,
//     image: "/products/P10.png",
//     isNew: true,
//     category: "Dining",
//     color: "brown",
//     measurements: "60 1/8x30 1/4",
//     description:
//       "Elegant wooden dining table with 4 matching chairs. Perfect for family meals and dinner parties, blending style and practicality.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 21,
//     name: "Black Brow Side table",
//     price: 89.0,
//     oldPrice: 129.0,
//     image: "/products/P11.png",
//     isNew: false,
//     category: "Kitchen",
//     color: "white",
//     measurements: "15 1/2x12 1/4",
//     description:
//       "Compact white kitchen stool, perfect for breakfast counters or small dining spaces. Lightweight yet sturdy design.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 22,
//     name: "Off-white Pillow",
//     price: 59.0,
//     oldPrice: 79.0,
//     image: "/products/P12.png",
//     isNew: false,
//     category: "Bathroom",
//     color: "gray",
//     measurements: "10 3/8x20 1/2",
//     description:
//       "Minimalist bathroom shelf made from eco-friendly materials. Keep toiletries organized and your bathroom clutter-free.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
// ];

// export const products = [
//   {
//     id: 11,
//     name: "Loveseat Sofa",
//     price: 25,
//     oldPrice: 100,
//     image: "/products/P1.png",
//     isNew: true,
//     category: "Living Room",
//     color: "black",
//     measurements: "17 1/2x20 5/8",
//     description:
//       "A compact loveseat sofa designed for small living spaces. Soft cushions and a sturdy frame make it perfect for relaxing, chatting, or enjoying cozy evenings.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 12,
//     name: "Luxury Sofa",
//     price: 299,
//     oldPrice: 500,
//     image: "/products/P2.png",
//     isNew: true,
//     category: "Living Room",
//     color: "red",
//     measurements: "18 3/4x22 1/4",
//     description:
//       "A premium luxury sofa crafted with plush cushions and elegant upholstery. Designed to elevate your living room with both comfort and sophistication.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 13,
//     name: "Table Lamp",
//     price: 199.0,
//     oldPrice: 400.0,
//     image: "/products/P3.png",
//     isNew: true,
//     category: "Living Room",
//     color: "black",
//     measurements: "19 1/2x21 1/2",
//     description:
//       "A modern table lamp that adds warm lighting and style to your living room. Perfect for side tables, reading corners, or decorative lighting.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 14,
//     name: "White Drawer Unit",
//     price: 499.0,
//     oldPrice: 799.0,
//     image: "/products/P4.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "white",
//     measurements: "6 1/2x12 3/8",
//     description:
//       "A sleek drawer unit offering practical storage for clothes, accessories, and daily essentials. Its minimalist design fits beautifully into modern bedrooms.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 15,
//     name: "Beige Table Lamp",
//     price: 358.87,
//     oldPrice: 699.0,
//     image: "/products/Pd.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "beige",
//     measurements: "5 1/2x11 1/4",
//     description:
//       "An elegant beige table lamp that provides soft ambient lighting. Ideal for bedside tables or reading corners in bedrooms.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 16,
//     name: "Compact Lamp",
//     price: 39.0,
//     oldPrice: 50.0,
//     image: "/products/P66.png",
//     isNew: true,
//     category: "Kitchen",
//     color: "blue",
//     measurements: "12 3/8x15 1/2",
//     description:
//       "A small yet functional lamp perfect for kitchen counters or work areas. Provides focused lighting while adding a decorative touch.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 17,
//     name: "Light Beige Pillow",
//     price: 3.99,
//     oldPrice: 5,
//     image: "/products/P7.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "beige",
//     measurements: "20 1/4x24 1/2",
//     description:
//       "Soft and breathable pillow designed for restful sleep. Its plush filling provides excellent neck and head support.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 18,
//     name: "Bedside Table Lamp",
//     price: 39.99,
//     oldPrice: 49.99,
//     image: "/products/P8.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "black",
//     measurements: "21 1/2x25 3/8",
//     description:
//       "A sleek bedside lamp that offers warm lighting for nighttime reading or relaxing before sleep.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 19,
//     name: "Bamboo Basket",
//     price: 9.99,
//     oldPrice: 12.34,
//     image: "/products/P9.png",
//     isNew: true,
//     category: "Kitchen",
//     color: "green",
//     measurements: "18 1/2x18 3/4",
//     description:
//       "A natural bamboo basket ideal for storing fruits, vegetables, or kitchen essentials while adding rustic charm.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 20,
//     name: "Cozy Sofa",
//     price: 499.0,
//     oldPrice: 999.0,
//     image: "/products/P10.png",
//     isNew: true,
//     category: "Living Room",
//     color: "brown",
//     measurements: "60 1/8x30 1/4",
//     description:
//       "A comfortable sofa with deep cushions and soft upholstery, perfect for relaxing with family or guests.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 21,
//     name: "Black Brown Side Table",
//     price: 89.0,
//     oldPrice: 129.0,
//     image: "/products/P11.png",
//     isNew: false,
//     category: "Living Room",
//     color: "black",
//     measurements: "15 1/2x12 1/4",
//     description:
//       "A modern side table perfect for placing lamps, books, or décor beside your sofa or chair.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 22,
//     name: "Off-white Pillow",
//     price: 59.0,
//     oldPrice: 79.0,
//     image: "/products/P12.png",
//     isNew: false,
//     category: "Bedroom",
//     color: "off-white",
//     measurements: "10 3/8x20 1/2",
//     description:
//       "A soft off-white pillow designed for both comfort and decorative use on beds or sofas.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 23,
//     name: "Modern Couch",
//     price: 420,
//     oldPrice: 700,
//     image: "/products/P2.png",
//     isNew: true,
//     category: "Living Room",
//     color: "gray",
//     measurements: "58x30",
//     description:
//       "A contemporary couch with sleek lines and comfortable cushions, ideal for stylish living rooms.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 24,
//     name: "Decorative Bed Pillow",
//     price: 12.99,
//     oldPrice: 19.99,
//     image: "/products/P7.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "cream",
//     measurements: "20x20",
//     description:
//       "A decorative pillow that adds softness and style to your bedroom décor.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 25,
//     name: "Wooden Dining Chair",
//     price: 120,
//     oldPrice: 180,
//     image: "/products/P11.png",
//     isNew: true,
//     category: "Dining",
//     color: "brown",
//     measurements: "18x20",
//     description:
//       "A sturdy wooden dining chair designed for comfort and durability during everyday meals.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 26,
//     name: "Bathroom Storage Basket",
//     price: 15,
//     oldPrice: 25,
//     image: "/products/P9.png",
//     isNew: true,
//     category: "Bathroom",
//     color: "natural",
//     measurements: "16x16",
//     description:
//       "A versatile basket perfect for storing towels, toiletries, or bathroom essentials.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 27,
//     name: "Patio Lounge Chair",
//     price: 210,
//     oldPrice: 320,
//     image: "/products/P10.png",
//     isNew: true,
//     category: "Outdoor",
//     color: "dark brown",
//     measurements: "55x28",
//     description:
//       "A relaxing outdoor lounge chair designed for patios, balconies, and garden spaces.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
//   {
//     id: 28,
//     name: "Minimalist Desk Lamp",
//     price: 45,
//     oldPrice: 70,
//     image: "/products/P3.png",
//     isNew: true,
//     category: "Bedroom",
//     color: "black",
//     measurements: "14x10",
//     description:
//       "A minimalist desk lamp providing focused lighting for reading, studying, or working.",
//     thumbnails: {
//       image1: "/products/Pd2.png",
//       image2: "/products/Pd3.png",
//       image3: "/products/Pd4.png",
//     },
//   },
// ];

export type SortOrder = "default" | "asc" | "desc";
export type TabType = "all" | "features";
export type GridType = "two" | "three" | "horizontal" | "vertical";

export type CartItem = {
  id: number;
  name: string;
  color: string;  
  price: number;
  quantity: number;
  image: string;
};