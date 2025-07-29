"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5">
        {/* Main content matching page.jsx */}
        <div className="flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left">
          <motion.p
            className="w-full uppercase text-amber-400 font-mono tracking-widest"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            art&tech polymath
          </motion.p>

          <motion.h1
            className="my-4 text-5xl md:text-6xl font-serif font-bold leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            zenbauhaus
          </motion.h1>

          <motion.p
            className="mb-8 text-2xl leading-normal text-gray-300"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            lifelong learner driven by boundless curiosity
          </motion.p>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 pointer-events-none" />
    </div>
  )
}
