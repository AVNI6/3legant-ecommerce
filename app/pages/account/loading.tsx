export default function AccountLoading() {
  return (
    <div className="w-full animate-pulse space-y-8">
      <div className="h-8 w-48 bg-gray-100 rounded-lg"></div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100"></div>
        ))}
      </div>
    </div>
  )
}
