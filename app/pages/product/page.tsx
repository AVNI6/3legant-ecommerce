import { Suspense } from "react";
import ProductPageContent from "./ProductPageContent";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default async function ProductPage() {
  return (
    <div className="pb-7">
      <Suspense fallback={<div className="container mx-auto px-4"><ProductGridSkeleton count={8} /></div>}>
        <ProductPageContent />
      </Suspense>
    </div>
  );
}