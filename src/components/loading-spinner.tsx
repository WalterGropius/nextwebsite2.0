"use client"

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="size-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 size-20 rounded-full border-4 border-transparent border-t-amber-400 animate-spin" style={{ animationDelay: '-0.5s' }} />
        </div>
        <div className="text-blue-600 font-medium text-sm">Loading...</div>
      </div>
    </div>
  )
}
