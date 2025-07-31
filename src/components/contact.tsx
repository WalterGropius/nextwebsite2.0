"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react"

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Collaborate</h2>

          <div className="text-center mb-16">
            <motion.p
              className="text-2xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              lets collaborate and bring new <span className="text-amber-400 font-bold">visions</span> to life together!
            </motion.p>

            <motion.p
              className="mb-8 text-lg text-gray-400"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Check out my{" "}
              <a href="/portfolio" className="text-amber-400 hover:text-amber-300 underline transition-colors">
                portfolio
              </a>{" "}
              to see more of my work.
            </motion.p>

            <motion.div
              className="flex justify-center gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href="mailto:zenbauhaus@gmail.com"
                className="group flex items-center gap-3 px-6 py-3 bg-amber-400 text-white rounded-lg font-medium hover:bg-amber-300 transition-colors"
              >
                <Mail size={20} />
                Get in Touch
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </a>
            </motion.div>
          </div>

          <motion.div
            className="flex justify-center gap-6 mb-16"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <a href="#" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors" aria-label="GitHub">
              <Github size={24} />
            </a>
            <a href="#" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors" aria-label="LinkedIn">
              <Linkedin size={24} />
            </a>
          </motion.div>

          <motion.div
            className="text-center text-sm text-gray-600 font-mono"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Crafted by zenbauhaus. © 2024
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
