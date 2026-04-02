// Shared variant helper utilities — used by cartSlice, wishlistSlice, productSlice

export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean)
  }
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized ? [normalized] : []
  }
  return []
}

export const resolveVariantColor = (value: unknown, fallback = "Default"): string => {
  const colors = toStringArray(value)
  return colors[0] ?? fallback
}

export const resolveVariantImage = (variant: any, product: any): string => {
  const colorImages = toStringArray(variant?.color_images ?? variant?.color_image)
  return colorImages[0] ?? String(product?.image ?? "")
}
