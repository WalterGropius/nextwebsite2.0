"use client"

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="size-16 rounded-full border-2 border-gray-800 border-t-amber-400 animate-spin" />
    </div>
  )
}
