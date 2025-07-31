"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const cards = [
  {
    title: "with a profound passion",
    content: (
      <>
        for the synergy of
        <br />
        <br />
        <span className="inline-block text-5xl md:text-6xl font-extrabold leading-none uppercase">
          ART
        </span>{" "}
        and{" "}
        <span className="inline-block text-5xl md:text-6xl font-extrabold leading-none uppercase">
          TECHNOLOGY
        </span>
      </>
    ),
  },
  {
    title: "bridging creative vision & technical execution",
    content: (
      <ul className="space-y-7">
        <li>
          whether supporting{" "}
          <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
            ARTISTS
          </span>{" "}
          in making their{" "}
          <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
            DREAMS
          </span>{" "}
          tangible or spicing up a technical query with a fresh idea,
        </li>
        <li>
          my heart lies at the crossroads of{" "}
          <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
            IMAGINATION
          </span>{" "}
          and{" "}
          <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
            INNOVATION
          </span>
          .
        </li>
      </ul>
    ),
  },
  {
    title: "learning from every mind",
    content: (
      <>
        fortunate to work with both artistic and technical minds, continually learning the importance of{" "}
        <span className="inline-block text-3xl md:text-4xl font-extrabold uppercase">
          FUNCTIONALITY
        </span>
        ,{" "}
        <span className="inline-block text-3xl md:text-4xl font-extrabold uppercase">
          AESTHETICS
        </span>{" "}
        and{" "}
        <span className="inline-block text-3xl md:text-4xl font-extrabold uppercase">
          USER EXPERIENCE
        </span>
        .
      </>
    ),
  },
  {
    title: "unleashing creativity & technology",
    content: (
      <>
        every collaboration is an opportunity to unleash{" "}
        <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
          VISIONARY CREATIVITY
        </span>{" "}
        and{" "}
        <span className="inline-block text-4xl md:text-5xl font-extrabold uppercase">
          STATE OF THE ART TECHNOLOGY
        </span>
        .
      </>
    ),
  },
]

export function Manifesto() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      id="manifesto"
      className="relative py-24 px-4 sm:px-12 md:px-20 overflow-hidden"
    >
      {/* Bold, minimal background shapes */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-black/5 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/10 blur-2xl" />

      <div
        ref={ref}
        className="relative z-10 mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 md:grid-rows-2 md:gap-10 w-full max-w-5xl"
      >
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col justify-between rounded-2xl bg-white shadow-2xl p-7 md:p-8 border border-black/10 min-h-[320px] transition-all"
            style={{
              minWidth: 0,
              flexBasis: "0",
              flexGrow: 1,
              flexShrink: 1,
              maxWidth: "100%",
            }}
            initial={{ opacity: 0, y: 80, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 80, scale: 0.98 }}
            transition={{ duration: 0.7, delay: 0.15 * idx, ease: "easeOut" }}
          >
            <motion.h2
              className="mb-5 text-2xl md:text-2xl lg:text-3xl font-extrabold leading-tight text-black tracking-tight uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.18 * idx + 0.1 }}
            >
              {card.title}
            </motion.h2>
            <motion.div
              className="text-lg md:text-lg lg:text-xl font-medium text-black"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.22 * idx + 0.2 }}
            >
              {card.content}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
