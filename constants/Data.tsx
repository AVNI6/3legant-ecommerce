import { MdOutlineLocalShipping } from "react-icons/md";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { CiLock } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { BsShopWindow } from "react-icons/bs";
import { BsTelephone } from "react-icons/bs"
export type { SortOrder, TabType, GridType, CartItem } from "@/types"

export const slides = [
  { id: 1, image: "/home.png" },
  { id: 2, image: "/home.png" },
  { id: 3, image: "/home.png" },
];

export const CURRENCY = {
  locale: "en-US",
  code: "USD",
};

const currencyFormatter = new Intl.NumberFormat(CURRENCY.locale, {
  style: "currency",
  currency: CURRENCY.code,
});

export const formatCurrency = (amount: number | null | undefined) => {
  const val = Number(amount);
  return isNaN(val) ? "$0.00" : currencyFormatter.format(val);
};

export const formatDate = (dateString: string | null | undefined, includeTime = false) => {
  if (!dateString) return "N/A";
  let dateStr = dateString;
  // If it's a Supabase timestamp without 'Z' or offset, it's likely UTC stored without TZ
  if (typeof dateStr === "string" && !dateStr.includes("Z") && !dateStr.includes("+")) {
    // Append Z to treat as UTC
    dateStr = dateStr + "Z";
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";

  if (includeTime) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC" // Force UTC to match database
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC" // Force UTC to match database
  });
};

export const getEffectivePrice = (product: { price: number; old_price: number; validationTill: string }) => {
  const { price, old_price, validationTill } = product;
  const numPrice = Number(price);
  const numOldPrice = Number(old_price);

  // If no validation date is set, assume it's a permanent discount or base price
  if (!validationTill || validationTill === "" || validationTill === "null") {
    return {
      price: numPrice,
      isOfferActive: true,
      hasDiscount: numOldPrice > numPrice && numPrice > 0
    };
  }

  let cleanDate = validationTill;
  // If it's DD-MM-YYYY (like 21-04-2026), flip it to YYYY-MM-DD for JS Date
  if (typeof cleanDate === "string" && /^\d{2}-\d{2}-\d{4}$/.test(cleanDate)) {
    const [d, m, y] = cleanDate.split("-");
    cleanDate = `${y}-${m}-${d}`;
  }

  const offerEndTs = new Date(cleanDate).getTime();

  // Check if date is valid
  if (isNaN(offerEndTs)) {
    return {
      price: numPrice,
      isOfferActive: true,
      hasDiscount: numOldPrice > numPrice && numPrice > 0
    };
  }

  const isOfferActive = offerEndTs > Date.now();
  const hasDiscount = numOldPrice > numPrice;

  // Final effective price: Revert to oldPrice only if offer is explicitly EXPIRED and a discount exists
  const effectivePrice = (!isOfferActive && hasDiscount) ? numOldPrice : numPrice;

  return {
    price: effectivePrice,
    isOfferActive,
    hasDiscount
  };
};

export const features = [
  { icon: <MdOutlineLocalShipping />, title: "Free Shipping", des: `Order above ${formatCurrency(200)}` },
  { icon: <LiaMoneyBillSolid />, title: "Money-back", des: "30 days guarantee" },
  { icon: <CiLock />, title: "Secure Payments", des: "Secured by Stripe" },
  { icon: <IoCallOutline />, title: "24/7 Support", des: "Phone and Email support" },
];

export const articles = [
  { id: 1, image: "/blog/a1.png", title: "7 ways to decor your home", date: "October 16, 2023", description: '3', type: "blog" },
  { id: 2, image: "/blog/a2.png", title: "Kitchen organization", date: "October 16, 2023", description: '3', type: "features" },
  { id: 3, image: "/blog/a3.png", title: "Decor your bedroom", date: "October 16, 2023", description: '3', type: "blog" },
  { id: 4, image: "/blog/a4.png", title: "Modern texas home is beautiful and completely kid-friendly", date: "October 16, 2023", description: '3', type: "blog" },
  { id: 5, image: "/blog/a5.png", title: "Kitchen organization", date: "October 16, 2023", description: '3', type: "features" },
  { id: 6, image: "/blog/a6.png", title: "Decor your bedroom", date: "October 16, 2023", description: '3', type: "blog" },
  { id: 7, image: "/blog/a7.png", title: "7 ways to decor your home", date: "October 16, 2023", description: '3', type: "blog" },
  { id: 8, image: "/blog/a8.png", title: "Kitchen organization", date: "October 16, 2023", description: '3', type: "features" },
  { id: 9, image: "/blog/a9.png", title: "Decor your bedroom", date: "October 16, 2023", description: '3', type: "blog" },
]
export const contact = [
  { icon: <BsShopWindow />, title: "Address", des: "234 Hai Trieu, Ho Chi Minh City, Viet Nam" },
  { icon: <BsTelephone />, title: "Contact Us", des: "+84 234 567 890" },
  { icon: <MdOutlineMailOutline />, title: "Email", des: "hello@3legant.com" },
];

export const SearchData = ["Table", "Lamp", "Chair", "Bedroom", "Living"]