// Product form utility functions

export const toDateInput = (v?: string) => v ? new Date(v).toISOString().slice(0, 10) : ""

export const clean = (v?: string) => (v ?? "").trim()

export const uid = () => Math.random().toString(36).slice(2, 9)

export const PRODUCT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || "product-images"
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

export const thumbsFromArray = (value?: string[]) =>
  (value ?? []).filter((item): item is string => Boolean(item))

export const toPublicImageUrl = (value?: string) => {
  const normalized = clean(value)
  if (!normalized) return ""
  if (/^(https?:|data:|blob:)/i.test(normalized) || !SUPABASE_URL) return normalized

  const withoutLeadingSlash = normalized.replace(/^\/+/, "")
  const publicPrefix = "storage/v1/object/public/"
  const cleanPath = withoutLeadingSlash.startsWith(publicPrefix)
    ? withoutLeadingSlash.slice(publicPrefix.length)
    : withoutLeadingSlash

  if (cleanPath.startsWith(`${PRODUCT_BUCKET}/`)) {
    return `${SUPABASE_URL}/storage/v1/object/public/${cleanPath}`
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_BUCKET}/${cleanPath}`
}

export const colorImagesFromVariant = (variant?: { color_images?: string[]; color_image?: string[] } | null) =>
  (variant?.color_images ?? variant?.color_image ?? []).filter(Boolean).map(toPublicImageUrl).filter(Boolean)
