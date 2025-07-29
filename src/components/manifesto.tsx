"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function Manifesto() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="manifesto" className="py-32 px-6">
      <div className="relative z-10 mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row lg:w-4/5">
        <motion.div
          ref={ref}
          className="rounded-lg bg-white bg-opacity-50 p-6 backdrop-blur-md"
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="mb-3 text-3xl font-bold leading-none text-gray-800"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            with a profound passion
          </motion.h2>

          <motion.p
            className="mb-8 text-2xl text-black"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            for the synergy of art and technology
          </motion.p>
        </motion.div>

        <div className="relative my-12 h-48 w-full py-6 sm:w-1/2 md:mb-40"></div>

        <motion.div
          className="rounded-lg bg-white bg-opacity-50 p-6 backdrop-blur-md"
          initial={{ opacity: 0, y: 100 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h2
            className="mb-3 text-3xl font-bold leading-none text-gray-800"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            dedicated to being a bridge between creative vision and technical execution
          </motion.h2>

          <motion.p
            className="mb-8 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            whether supporting <span className="text-2xl font-bold">artists</span> in making their{" "}
            <span className="text-2xl font-bold">dreams</span> tangible or spicing up a simple technical query with a
            fresh idea,
          </motion.p>

          <motion.p
            className="mb-8 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            my heart lies at the crossroads of <span className="text-2xl font-bold">imagination</span> and{" "}
            <span className="text-2xl font-bold">innovation</span>.
          </motion.p>

          <motion.p
            className="mb-8 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            fortunate to work with both artistic and technical minds, continually learning the importance of
            <span className="text-2xl font-bold"> functionality</span>,{" "}
            <span className="text-2xl font-bold">aesthetics</span> and{" "}
            <span className="text-2xl font-bold">user experience</span>.
          </motion.p>

          <motion.p
            className="mb-8 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            every collaboration is an opportunity to unleash{" "}
            <span className="text-2xl font-bold">visionary creativity</span> and{" "}
            <span className="text-2xl font-bold">state of the art technology</span>.
          </motion.p>

          <motion.p
            className="mb-8 text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            lets collaborate and bring new <span className="text-xl font-bold">visions</span> to life together!
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
