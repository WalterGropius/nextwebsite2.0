"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Heart, Lightbulb, Users } from "lucide-react"

const philosophyAreas = [
  {
    title: "Functionality",
    icon: Lightbulb,
    description: "Building solutions that work seamlessly and serve their intended purpose with reliability and efficiency.",
    color: "text-amber-400",
  },
  {
    title: "Aesthetics",
    icon: Heart,
    description: "Creating beautiful experiences that inspire and delight, understanding that form and function are inseparable.",
    color: "text-cyan-400",
  },
  {
    title: "User Experience",
    icon: Users,
    description: "Crafting intuitive interactions that empower users and make complex technology accessible to everyone.",
    color: "text-emerald-400",
  },
]

export function Arsenal() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-16 text-center">Philosophy</h2>

          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Continually learning the importance of balancing the essential pillars
              that make technology not just functional, but truly meaningful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {philosophyAreas.map((area, index) => (
              <motion.div
                key={area.title}
                className="group p-8 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-lg bg-gray-800 ${area.color}`}>
                    <area.icon size={24} />
                  </div>
                  <h3 className={`text-2xl font-serif ${area.color}`}>{area.title}</h3>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {area.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
