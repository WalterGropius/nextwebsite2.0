"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
      <motion.div
        className="w-16 h-16 border-2 border-zinc-800 border-t-amber-400 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}
