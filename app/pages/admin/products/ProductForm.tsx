"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useForm, FieldError } from "react-hook-form"
import { supabase } from "@/lib/supabase/client"
import { useAppDispatch } from "@/store/hooks"
import { fetchProducts } from "@/store/slices/productSlice"
import { useToast } from "@/components/admin/Toast"
import { type ProductType } from '@/types/index'

type AdminProduct = Partial<ProductType> & { id: number }

type VariantRow = {
  id?: number
  key: string
  color: string
  colorImages: string[]
  size: string
  sku: string
  price: string
  old_price: string
  stock: string
  thumbnails: string[]
}

type BaseFormValues = {
  name: string
  category: string
  description: string
  measurements: string
  packageText: string
  isNew: boolean
  image: string
  validationTill: string
  thumbnails: string
}

const categories = [
  "All Rooms", "Living Room", "Bedroom", "Kitchen",
  "Bathroom", "Dining", "Outdoor",
]

import { toPublicImageUrl, thumbsFromArray, colorImagesFromVariant, clean, uid } from '@/lib/utils/productUtils'

const toDateInput = (v?: string) => v ? new Date(v).toISOString().slice(0, 10) : ""

const blankVariant = (): VariantRow => ({
  key: uid(), color: "", colorImages: [], size: "",
  sku: "", price: "", old_price: "", stock: "0",
  thumbnails: [],
})

export default function ProductForm({
  product,
  allVariants = [],
  close,
}: {
  product: AdminProduct | null
  allVariants?: ProductType[]   // ALL existing variants for this product
  close: () => void
}) {
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const seedVariant = allVariants[0] ?? product ?? null
  const initialVariants: VariantRow[] = allVariants.length > 0
    ? allVariants.map((variant, idx) => {
      const variantImages = colorImagesFromVariant(variant)
      const finalColorImages = (idx === 0 && variantImages.length === 0 && product?.image)
        ? [toPublicImageUrl(product.image)]
        : variantImages

      return {
        id: variant.id ? Number(variant.id) : undefined,
        key: uid(),
        color: variant.color ?? "",
        colorImages: finalColorImages,
        size: variant.size ?? "",
        sku: variant.sku ?? "",
        price: String(variant.price ?? ""),
        old_price: String(variant.old_price ?? ""),
        stock: String(variant.stock ?? 0),
        thumbnails: thumbsFromArray(variant.thumbnails).map(toPublicImageUrl),
      }
    })
    : [{
      id: undefined, // CRITICAL FIX: Brand new variant should not inherit the PRODUCT ID
      key: uid(),
      color: seedVariant?.color ?? "",
      colorImages: colorImagesFromVariant(seedVariant).length > 0
        ? colorImagesFromVariant(seedVariant)
        : (product?.image ? [toPublicImageUrl(product.image)] : []),
      size: seedVariant?.size ?? "",
      sku: seedVariant?.sku ?? "",
      price: String(seedVariant?.price ?? ""),
      old_price: String(seedVariant?.old_price ?? ""),
      stock: String(seedVariant?.stock ?? 0),
      thumbnails: thumbsFromArray(seedVariant?.thumbnails).map(toPublicImageUrl),
    }]

  const [variants, setVariants] = useState<VariantRow[]>(initialVariants)

  const { register, setValue, watch, getValues, handleSubmit, formState: { errors } } =
    useForm<BaseFormValues>({
      defaultValues: {
        name: product?.name ?? "",
        category: product?.category ?? "",
        description: product?.description ?? "",
        measurements: product?.measurements ?? "",
        packageText: product?.package ?? "",
        image: toPublicImageUrl(product?.image ?? ""),
        validationTill: toDateInput(product?.validation_till),
        thumbnails: thumbsFromArray(seedVariant?.thumbnails).map(toPublicImageUrl).filter(Boolean).join(", "),
      },
    })

  const cachedImage = watch("image")
  const cachedThumbnails = watch("thumbnails")
  const thumbnailsArray = useMemo(() =>
    cachedThumbnails.split(",").map(u => u.trim()).filter(Boolean),
    [cachedThumbnails]
  )

  const uploadFile = async (
    file: File,
    target: "image" | "thumbnails" | { variantKey: string }
  ) => {
    const form = new FormData()
    form.append("file", file)
    const key = typeof target === "string" ? target : `${target.variantKey}-color`
    setUploadingField(key)

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok || json.error) { toast("Upload failed: " + (json.error ?? "Unknown"), "error"); return }

      if (target === "image") {
        setValue("image", json.url, { shouldDirty: true })
      } else if (target === "thumbnails") {
        const current = getValues("thumbnails").trim()
        setValue("thumbnails", current ? `${current}, ${json.url}` : json.url, { shouldDirty: true })
      } else if (typeof target === "object" && 'variantKey' in target) {
        // If it's a variant color image
        setVariants(vs => vs.map(v =>
          v.key === (target as { variantKey: string }).variantKey
            ? { ...v, colorImages: [...v.colorImages, json.url] }
            : v
        ))
      }
      toast("Image uploaded")
    } finally {
      setUploadingField(null)
    }
  }

  const removeImage = (url: string, field: "image" | "thumbnails") => {
    if (field === "image") { setValue("image", "", { shouldDirty: true }); return }
    const urls = cachedThumbnails.split(",").map(u => u.trim()).filter(Boolean)
    setValue("thumbnails", urls.filter(u => u !== url).join(", "), { shouldDirty: true })
  }

  const removeColorImage = (variantKey: string, url: string) => {
    setVariants(vs => vs.map(v =>
      v.key === variantKey ? { ...v, colorImages: v.colorImages.filter(u => u !== url) } : v
    ))
  }

  const updateVariant = (id: string, key: keyof VariantRow, val: string) =>
    setVariants(vs => vs.map(v => v.key === id ? { ...v, [key]: val } : v))

  const addVariant = () => setVariants(vs => [...vs, blankVariant()])

  const removeVariant = (id: string) =>
    setVariants(vs => vs.length > 1 ? vs.filter(v => v.key !== id) : vs)

  const onSubmit = async (base: BaseFormValues) => {
    // 1. Basic validation for prices
    for (const v of variants) {
      if (!v.price || isNaN(Number(v.price))) {
        toast(`Variant "${v.color || sizeLabel(v) || `#${variants.indexOf(v) + 1}`}" needs a valid price`, "error")
        return
      }
    }

    // 2. SKU Uniqueness check within the form
    const skuMap: Record<string, boolean> = {}
    for (const v of variants) {
      const s = clean(v.sku)
      if (s) {
        if (skuMap[s]) {
          toast(`Duplicate SKU found: "${s}". Every variant must have a unique SKU.`, "error")
          return
        }
        skuMap[s] = true
      }
    }

    setSubmitting(true)
    try {
      const sharedThumbnails = base.thumbnails
        .split(",").map(t => toPublicImageUrl(t.trim())).filter(Boolean)
      const thumbnailsValue = sharedThumbnails.length > 0 ? sharedThumbnails : null

      const firstVariant = variants[0]
      const firstImage = firstVariant?.colorImages?.[0] || sharedThumbnails[0] || ""
      const normalizedMainImage = toPublicImageUrl(firstImage)

      const productPayload = {
        name: clean(base.name),
        category: clean(base.category),
        description: clean(base.description),
        measurements: clean(base.measurements),
        package: clean(base.packageText),
        image: clean(normalizedMainImage),
        validation_till: base.validationTill || null,
      }

      let productId: number

      if (product?.id) {
        const { data: updatedProduct, error: updateErr } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", product.id)
          .select("id")
          .single()

        if (updateErr || !updatedProduct) {
          throw new Error(`Product update failed: ${updateErr?.message ?? "no data returned"}`)
        }

        productId = Number(updatedProduct.id)
      } else {
        const { data: createdProduct, error: createErr } = await supabase
          .from("products")
          .insert(productPayload)
          .select("id")
          .single()

        if (createErr || !createdProduct) {
          throw new Error(`Product create failed: ${createErr?.message ?? "no data returned"}`)
        }

        productId = Number(createdProduct.id)
      }

      const variantRows = variants.map(({ id: variantId, color, size, sku, price, old_price, stock, colorImages, thumbnails: variantThumbs }, index) => {
        let cleanSku = clean(sku)

        // AUTO-GENERATE SKU IF MISSING
        // If user leaves it blank, we generate one like: PRODNAME-COLOR-SIZE-IDX
        // This avoids NULL collisions if for some reason the DB is picky (though Postgres usually isn't)
        // and provides a better data structure.
        if (!cleanSku) {
          const baseName = (clean(base.name) || "PROD").slice(0, 5).toUpperCase().replace(/\s+/g, "-")
          const colorName = (clean(color) || "UNI").slice(0, 3).toUpperCase()
          const sizeName = (clean(size) || "NA").slice(0, 2).toUpperCase()
          cleanSku = `${baseName}-${colorName}-${sizeName}-${productId}-${index + 1}`
        }

        // Connect the Shared Gallery: 
        // If the user has provided images in the shared gallery, use those for all variants.
        // This ensures the "Shared Product Gallery" UI actually saves to the variant thumbnails.
        const finalThumbnails = thumbnailsValue || (variantThumbs.length > 0 ? variantThumbs.map(toPublicImageUrl).filter(Boolean) : null)

        return {
          ...(variantId ? { id: Number(variantId) } : {}),
          product_id: productId,
          color: clean(color) || null,
          size: clean(size) || null,
          sku: cleanSku,
          price: Number(price),
          old_price: old_price && Number(old_price) > 0 ? Number(old_price) : null,
          stock: Number(stock) || 0,
          thumbnails: finalThumbnails,
          color_images: colorImages.length > 0 ? colorImages.map(toPublicImageUrl).filter(Boolean) : null,
        }
      })

      // If editing, delete only variants that the user removed in the UI.
      if (product?.id) {
        const existingVariantIds = (allVariants ?? [])
          .map((v) => Number(v.id))
          .filter((n) => Number.isFinite(n))

        const incomingVariantIds = variantRows
          .map((v) => Number(v.id))
          .filter((n) => Number.isFinite(n))

        const removedVariantIds = existingVariantIds.filter((id) => !incomingVariantIds.includes(id))

        if (removedVariantIds.length > 0) {
          const { error: delErr } = await supabase
            .from("product_variant")
            .delete()
            .eq("product_id", productId)
            .in("id", removedVariantIds)

          if (delErr) throw new Error(`Variant delete failed: ${delErr.message}`)
        }
      }

      const variantsToUpdate = variantRows.filter(v => v.id !== undefined)
      const variantsToInsert = variantRows.map(({ id, ...rest }) => rest).filter((_, idx) => variantRows[idx].id === undefined)


      if (variantsToUpdate.length > 0) {
        const { error: updErr } = await supabase
          .from("product_variant")
          .upsert(variantsToUpdate)

        if (updErr) {
          if (updErr.message.includes("product_variant_sku_key")) {
            throw new Error("One or more SKUs are already in use by another product. Please use unique SKUs.")
          }
          throw new Error(`Variant update failed: ${updErr.message}`)
        }
      }

      if (variantsToInsert.length > 0) {
        const { error: insErr } = await supabase
          .from("product_variant")
          .insert(variantsToInsert)

        if (insErr) {
          if (insErr.message.includes("product_variant_sku_key")) {
            throw new Error("One or more SKUs are already in use by another product. Please use unique SKUs.")
          }
          throw new Error(`Variant insert failed: ${insErr.message}`)
        }
      }

      toast(product?.id ? "Product updated successfully" : "Product created successfully")
      await dispatch(fetchProducts())
      close()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      console.error("[ProductForm] save error:", err)
      toast(msg, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const sizeLabel = (v: VariantRow) => v.size ? ` / ${v.size}` : ""

  const ImageThumb = ({
    url, onRemove, size = "w-20 h-20",
  }: { url: string; onRemove: () => void; size?: string }) => (
    <div className={`relative group ${size} rounded-lg overflow-hidden border border-gray-200`}>
      <img src={url} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )

  const UploadZone = ({
    label, multiple = false, loading = false,
    onFiles,
  }: { label: string; multiple?: boolean; loading?: boolean; onFiles: (files: File[]) => void }) => (
    <div
      className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer transition
        ${loading ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}`}
      onClick={() => {
        const input = document.createElement("input")
        input.type = "file"; input.accept = "image/*"; input.multiple = multiple
        input.onchange = (e) => {
          const files = Array.from((e.target as HTMLInputElement).files ?? [])
          if (files.length) onFiles(files)
        }
        input.click()
      }}
      onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50") }}
      onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50") }}
      onDrop={e => {
        e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50")
        const files = Array.from(e.dataTransfer.files)
        if (files.length) onFiles(files)
      }}
    >
      {loading
        ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        : <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      }
      <span className="text-xs text-gray-500">{loading ? "Uploading…" : label}</span>
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{product ? "Edit Product" : "Add Product"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {product ? `ID #${product.id}` : "New product will be created in products + product_variant tables"}
            </p>
          </div>
          <button onClick={close} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">

          <Section title="Basic Information" icon="📦">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Product Name" error={errors.name}>
                  <input {...register("name", { required: "Name is required" })}
                    className={input()} placeholder="e.g. Modern Oak Shelf" />
                </Field>
              </div>

              <Field label="Category" error={errors.category}>
                <select {...register("category", { required: "Category is required" })} className={input()}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Package Contents">
                <input {...register("packageText")} className={input()} placeholder="e.g. 1 pc, mounting hardware" />
              </Field>

              <Field label="Measurements" className="md:col-span-2">
                <input {...register("measurements")} className={input()} placeholder="e.g. 120 × 40 × 30 cm" />
              </Field>

              <Field label="Description" className="md:col-span-2">
                <textarea {...register("description")} rows={3} className={input()} />
              </Field>

              <Field label="Offer Valid Till">
                <input type="date" {...register("validationTill")} className={input()} />
              </Field>
            </div>
          </Section>

          <Section title="Shared Product Gallery" icon="🖼️">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  These photos appear in the gallery for all variants.
                  The **Main Image** will be automatically taken from the first variant's first image.
                </p>
                <UploadZone
                  label="Click or drag to upload gallery photos (multi-select)"
                  multiple
                  loading={uploadingField === "thumbnails"}
                  onFiles={(files) => {
                    void Promise.all(files.map((file) => uploadFile(file, "thumbnails")))
                  }}
                />
                <input {...register("thumbnails")} className={`${input()} mt-3`}
                  placeholder="url1, url2, url3 (comma-separated)" />
                {cachedThumbnails && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {thumbnailsArray.map((rawUrl, i) => (
                      <ImageThumb key={i} url={toPublicImageUrl(rawUrl)}
                        onRemove={() => removeImage(rawUrl, "thumbnails")} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>

          <Section
            title="Product Variants"
            icon="🎨"
            action={
              <button type="button" onClick={addVariant}
                className="flex items-center gap-1.5 text-sm bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Variant
              </button>
            }
          >
            <p className="text-xs text-gray-400 -mt-2 mb-4">
              Each variant is stored as a separate row in <code className="bg-gray-100 px-1 rounded">product_variant</code>.
              Add one row per color/size combination.
            </p>

            <div className="space-y-4">
              {variants.map((v, idx) => (
                <div key={v.key} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Variant {idx + 1}
                      {v.color && <span className="ml-2 text-gray-400 font-normal">- {v.color}</span>}
                    </span>
                    {variants.length > 1 && (
                      <button type="button" onClick={() => removeVariant(v.key)}
                        className="text-xs text-red-500 hover:text-red-700 transition flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                      <input value={v.color} onChange={e => updateVariant(v.key, "color", e.target.value)}
                        className={inputSm()} placeholder="e.g. Walnut Brown" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                      <input value={v.size} onChange={e => updateVariant(v.key, "size", e.target.value)}
                        className={inputSm()} placeholder="e.g. L" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                      <input value={v.sku} onChange={e => updateVariant(v.key, "sku", e.target.value)}
                        className={inputSm()} placeholder="e.g. OAK-L-BR" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                      <input type="number" min={0} value={v.stock}
                        onChange={e => updateVariant(v.key, "stock", e.target.value)}
                        className={inputSm()} placeholder="0" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input type="number" step="0.01" value={v.price}
                        onChange={e => updateVariant(v.key, "price", e.target.value)}
                        className={inputSm()} placeholder="0.00" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Old Price</label>
                      <input type="number" step="0.01" value={v.old_price}
                        onChange={e => updateVariant(v.key, "old_price", e.target.value)}
                        className={inputSm()} placeholder="0.00" />
                    </div>

                    <div className="col-span-2 md:col-span-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Color Images
                        <span className="ml-1.5 text-gray-400 font-normal">
                          (images specific to this color variant)
                        </span>
                      </label>
                      <div className="flex gap-3 items-start flex-wrap">
                        {v.colorImages.map((rawUrl, i) => (
                          <ImageThumb key={i} url={toPublicImageUrl(rawUrl)} size="w-16 h-16"
                            onRemove={() => removeColorImage(v.key, rawUrl)} />
                        ))}
                        <UploadZone
                          label="Add color image"
                          multiple
                          loading={uploadingField === `${v.key}-color`}
                          onFiles={(files) => {
                            void Promise.all(files.map((file) =>
                              uploadFile(file, { variantKey: v.key })
                            ))
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* ADD VARIANT BUTTON AT BOTTOM */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:border-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-2 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Variant
                </button>
              </div>
            </div>
          </Section>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={close}
              className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 text-sm bg-black text-white rounded-lg disabled:opacity-50 hover:bg-gray-800 transition flex items-center gap-2">
              {submitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {submitting ? "Saving…" : product ? "Update Product" : "Create Product"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

function input() {
  return "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition cursor-pointer"
}
function inputSm() {
  return "w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition cursor-pointer"
}

function Field({
  label, children, error, className = "",
}: {
  label: string; children: ReactNode; error?: FieldError; className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
}

function Section({
  title, icon, children, action,
}: {
  title: string; icon: string; children: ReactNode; action?: ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}