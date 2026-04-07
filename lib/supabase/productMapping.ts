import { type ProductType } from '@/types/index'
import { toStringArray, resolveVariantColor as toSingleColor } from '@/lib/utils/variantUtils'
import { getEffectivePrice } from '@/constants/Data'

export const isWithin7Days = (dateString?: string) => {
    if (!dateString) return false;
    const createdAt = new Date(dateString);
    if (isNaN(createdAt.getTime())) return false;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
}

export const buildProductObject = (
    p: any,
    v: any | null,
    variantThumbsForBase: string[],
    productColorImages: string[],
    productThumbs: any[],
    productVariants: any[]
): ProductType => {
    const productId = Number(p.id)
    const isVariant = v !== null

    const variantColors = isVariant ? toStringArray(v.color) : []
    const variantColorImages = isVariant ? toStringArray(v.color_images) : []
    const variantThumbs = isVariant ? toStringArray(v.thumbnails) : variantThumbsForBase
    const variantMainImage = isVariant && variantColorImages.length
        ? variantColorImages[0]
        : String(p.image ?? "")

    const variantIdFromDB = isVariant ? Number(v.id) : productId

    const { price: effectivePrice, oldPrice: effectiveOldPrice } = getEffectivePrice({
        price: isVariant ? Number(v.price ?? p.price ?? 0) : Number(p.price ?? 0),
        old_price: isVariant
            ? Number(v.old_price ?? p.old_price ?? p.oldPrice ?? 0)
            : Number(p.oldPrice ?? p.old_price ?? 0),
        validationTill: String(p.validation_till ?? p.validationTill ?? "")
    });

    return {
        id: productId,
        variant_id: variantIdFromDB,
        name: String(p.name ?? "Unnamed Product"),
        price: effectivePrice,
        old_price: effectiveOldPrice || 0,
        image: variantMainImage,
        validation_till: String(p.validation_till ?? p.validationTill ?? ""),
        description: String(p.description ?? ""),
        category: String(p.category ?? "All Rooms"),
        color: isVariant && variantColors.length ? variantColors[0] : toSingleColor(p.color),
        color_image: isVariant && variantColorImages.length ? variantColorImages : productColorImages,
        measurements: String(p.measurements ?? ""),
        package: String(p.package ?? ""),
        sku: isVariant ? String(v.sku ?? "") : String(p.sku ?? ""),
        stock: isVariant ? Number(v.stock ?? 0) : Number(p.stock ?? 0),
        size: String(p.size ?? ""),
        created_at: String(p.created_at ?? ""),
        is_new: isWithin7Days(p.created_at),
        is_deleted: !!p.is_deleted,
        ...(isVariant && productVariants.length > 0 && { product_variant: productVariants }),
        thumbnails: variantThumbs,
    }
}

export const mapProducts = (products: any[]): ProductType[] => {
    const rows: ProductType[] = []

    for (const p of products) {
        const productVariants = p.product_variant ?? []
        const firstVariant = productVariants[0]
        const variantThumbsForBase = firstVariant ? toStringArray(firstVariant.thumbnails) : []
        const productColorImages = toStringArray(p.color_images)
        const productThumbs = (p.thumbnails && Array.isArray(p.thumbnails))
            ? p.thumbnails
            : (variantThumbsForBase.length > 0 ? variantThumbsForBase : [p.thumbnails1, p.thumbnails2, p.thumbnails3].filter(Boolean))

        if (productVariants.length === 0) {
            rows.push(buildProductObject(p, null, variantThumbsForBase, productColorImages, productThumbs, productVariants))
        } else {
            for (const v of productVariants) {
                rows.push(buildProductObject(p, v, variantThumbsForBase, productColorImages, productThumbs, productVariants))
            }
        }
    }

    return rows
}

