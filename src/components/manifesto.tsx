"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function Manifesto() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="manifesto" className="py-32 px-6 max-w-4xl mx-auto">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 100 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Invocation</h2>

        <div className="prose prose-lg prose-invert max-w-none">
          <motion.p
            className="text-xl leading-relaxed mb-8 text-zinc-300"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            An essence-seeking innovator, blending deep understanding with relentless execution. I navigate complex
            challenges with a research-driven approach and unwavering perseverance, creating perspective-shifting
            solutions that empower others to achieve the impossible.
          </motion.p>

          <motion.p
            className="text-xl leading-relaxed mb-8 text-zinc-300"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            My work is a journey from <span className="text-amber-400 font-medium">Boids to Brains</span>—an exploration
            of how simple rules give rise to complex, lifelike emergent behavior. With a profound passion for the
            synergy of art and technology, I dedicate myself to bridging creative vision and technical execution.
          </motion.p>

          <motion.p
            className="text-xl leading-relaxed text-cyan-400 font-medium"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Let&apos;s collaborate and bring new visions to life.
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
