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
  { id: 2, image: "/homeimage.png" },
  { id: 3, image: "/homeimage2.png" },
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
  const numPrice = Number(product.price);
  const numOldPrice = Number(product.old_price);

  // 1. Determine if a discount even exists in the data
  const hasPotentialDiscount = numOldPrice > numPrice && numPrice > 0;

  // 2. Parse validation date with extra flexibility
  let isExpired = false;
  const rawDate = product.validationTill;

  if (rawDate && rawDate !== "" && rawDate !== "null") {
    let dateToParse = rawDate;

    // Handle DD-MM-YYYY or DD/MM/YYYY formats by converting to YYYY-MM-DD
    const dmyMatch = rawDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const [_, day, month, year] = dmyMatch;
      dateToParse = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    const offerEnd = new Date(dateToParse);

    // If it's a valid date, check if it has passed
    if (!isNaN(offerEnd.getTime())) {
      // We check if "now" is past the expiration. 
      // Note: new Date("YYYY-MM-DD") is midnight UTC.
      isExpired = offerEnd.getTime() <= Date.now();
    }
  }

  // 3. Force Reversion if Expired
  // If the offer is expired, we hide the discount price and treat old_price as the only price.
  if (isExpired && hasPotentialDiscount) {
    return {
      price: numOldPrice,
      oldPrice: null,
      hasDiscount: false,
      isOfferActive: false
    };
  }

  // 4. Regular Logic for Active Offers
  return {
    price: hasPotentialDiscount ? numPrice : (numOldPrice || numPrice),
    oldPrice: hasPotentialDiscount ? numOldPrice : null,
    hasDiscount: hasPotentialDiscount,
    isOfferActive: !isExpired
  };
};

export const NEW_PRODUCT_DAYS = 7;

export const isNewProduct = (createdAt: string | null | undefined) => {
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) return false;

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - NEW_PRODUCT_DAYS);

  return createdDate > thresholdDate;
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