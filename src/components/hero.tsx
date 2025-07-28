"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="text-center z-10">
        <motion.h1
          className="text-6xl md:text-8xl font-serif font-light mb-6 tracking-wide"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Eliáš Bauer
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-zinc-400 font-light tracking-widest"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          Building Emergent Worlds
        </motion.p>

        <motion.div
          className="mt-8 text-sm text-zinc-500 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Art & Tech Polymath
        </motion.div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950/80 pointer-events-none" />
    </div>
  )
}
