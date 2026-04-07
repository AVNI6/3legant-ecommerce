import { getEffectivePrice } from "@/constants/Data";

type ProductFeedVariantRow = {
  id: number;
  color: string | null;
  price: number | string | null;
  old_price: number | string | null;
  stock: number | string | null;
  thumbnails?: unknown;
  color_images?: unknown;
  products: {
    id: number;
    name: string;
    category: string;
    image: string;
    measurements: string;
    is_new: boolean;
    created_at: string;
    description: string;
    is_deleted: boolean;
    validation_till: string;
  };
};

type ReviewRow = {
  product_id: number | string;
  rating: number | string | null;
};

const toArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? [value] : [];
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  return [];
};

export function mapProductFeedRows(variantsData: ProductFeedVariantRow[] = [], reviewsData: ReviewRow[] = []) {
  const groupedReviews: Record<number, { sum: number; count: number }> = {};

  reviewsData.forEach((row) => {
    const productId = Number(row.product_id);
    if (!groupedReviews[productId]) {
      groupedReviews[productId] = { sum: 0, count: 0 };
    }

    groupedReviews[productId].sum += Number(row.rating ?? 0);
    groupedReviews[productId].count += 1;
  });

  return variantsData.map((variant) => {
    const product = variant.products;
    const reviewEntry = groupedReviews[product.id];
    const colorImages = toArray(variant.color_images);

    const { price: effectivePrice } = getEffectivePrice({
      price: Number(variant.price || 0),
      old_price: Number(variant.old_price || 0),
      validationTill: product.validation_till,
    });

    return {
      id: product.id,
      variant_id: variant.id,
      name: product.name,
      category: product.category,
      price: effectivePrice,
      old_price: Number(variant.old_price || 0),
      image: colorImages[0] || product.image,
      is_new: product.is_new,
      created_at: product.created_at,
      description: product.description,
      measurements: product.measurements,
      color: variant.color,
      validation_till: product.validation_till,
      stock: Number(variant.stock ?? 0),
      reviewStats: reviewEntry
        ? { rating: reviewEntry.sum / reviewEntry.count, count: reviewEntry.count }
        : { rating: 0, count: 0 },
    };
  });
}