import { BlogGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full px-4 sm:px-12 md:px-10 lg:px-30 py-10">
      <div className="mb-10 space-y-4">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-4 w-72 mx-auto" />
      </div>
      <BlogGridSkeleton count={6} gridType="three" />
    </div>
  );
}
