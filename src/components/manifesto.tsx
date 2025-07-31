"use client"

import { useRef, useEffect, useState } from "react"

const cards = [
  {
    title: "Art Meets Technology",
    content: (
      <>
        I bridge the gap between{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--vermilion)' }}>
          CREATIVE VISION
        </span>{" "}
        and{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--cobalt-blue)' }}>
          TECHNICAL EXECUTION
        </span>.
        <br />
        <br />
        Whether you need immersive VR experiences, AI-powered solutions, or cutting-edge web applications, I turn ideas into reality.
      </>
    ),
  },
  {
    title: "The Polymath's Advantage",
    content: (
      <>
        My skills cover multiple fields, including{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--fern-green)' }}>
          XR/VFX
        </span>{" "}
        ,{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--cobalt-blue)' }}>
          AI SYSTEMS
        </span>{" "}
        ,{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--vermilion)' }}>
          FULL-STACK
        </span>{" "}
        and{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--pistachio)' }}>
          VISUAL ART
        </span>
        <br />
        <br />
        I see connections others may overlook.
        <br />
        <br />
        Expect fresh perspectives and unexpected solutions.
      </>
    ),
  },
  {
    title: "Creative Technologist, Not Just Developer",
    content: (
      <>
        Every project is an opportunity to create something that feels magical.
        <br />
        <br />
        Let's build something that makes people say "wow."
      </>
    ),
  },
  {
    title: "Solving the Impossible",
    content: (
      <>
        I'm drawn to challenges that seem{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--fern-green)' }}>
          IMPOSSIBLE
        </span>{" "}
        at first glance.
        <br />
        <br />
        That's where breakthrough innovation happens.
        <br />
        <br />
        If you have a wild idea that others say can't be done, let's prove them wrong!
      </>
    ),
  },
]

export function Manifesto() {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold: 0.1, rootMargin: "-100px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="manifesto"
      className="relative py-24 px-4 sm:px-12 md:px-20 overflow-hidden"
    >
      {/* Soft, playful background shapes */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full blur-2xl" style={{ backgroundColor: 'rgba(238, 74, 68, 0.12)' }} />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(29, 31, 44, 0.13)' }} />

      <div
        ref={ref}
        className="relative z-10 mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 md:grid-rows-2 md:gap-10 w-full max-w-5xl"
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between rounded-2xl bg-white shadow-2xl p-7 md:p-8 border border-black/10 min-h-[220px] transition-all ${isInView ? "animate-scale-in" : "opacity-0"
              }`}
            style={{
              minWidth: 0,
              flexBasis: "0",
              flexGrow: 1,
              flexShrink: 1,
              maxWidth: "100%",
              animationDelay: `${0.15 * idx}s`,
            }}
          >
            <h2
              className={`mb-5 text-2xl md:text-2xl lg:text-3xl font-extrabold leading-tight text-black tracking-tight uppercase ${isInView ? "animate-slide-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${0.18 * idx + 0.1}s`, color: 'var(--cobalt-blue)' }}
            >
              {card.title}
            </h2>
            <div
              className={`text-lg md:text-lg lg:text-xl font-medium text-black ${isInView ? "animate-slide-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${0.22 * idx + 0.2}s` }}
            >
              {card.content}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
