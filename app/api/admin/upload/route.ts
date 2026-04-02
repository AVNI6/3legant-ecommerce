import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || "product-images";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function ensureBucketExists(supabase: any, bucket: string) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw new Error(`Failed to list storage buckets: ${listError.message}`);

  const exists = buckets?.some((entry: { name: string }) => entry.name === bucket);
  if (exists) return;

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"],
  });

  if (createError) throw new Error(`Failed to create bucket "${bucket}": ${createError.message}`);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getServiceClient();
    await ensureBucketExists(supabase, BUCKET);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
