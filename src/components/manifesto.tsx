"use client"

import { useRef, useEffect, useState } from "react"

const cards = [
  {
    title: "Art Meets Tech",
    content: (
      <>
        I love both{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--vermilion)' }}>
          ART
        </span>{" "}
        and{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--cobalt-blue)' }}>
          TECHNOLOGY
        </span>{" "}
        and especially finding ways to{" "}
        <span className="inline-block text-5xl md:text-3xl font-extrabold leading-none uppercase" style={{ color: 'var(--fern-green)' }}>
          MAKE THEM WORK TOGETHER
        </span>.
        <br />
        <br />
        It’s just applied curiosity and a hard head.
      </>
    ),
  },
  {
    title: "Collaboration is Everything",
    content: (
      <>
        I get a kick out of teaming up with people from all walks—artists, engineers, dreamers, doers.
        <br />
        <br />
        Every project is a chance to learn something new and make something better, together.
      </>
    ),
  },
  {
    title: "Keep It Real, Keep It Useful",
    content: (
      <>
        I strive to make things work, look good, and feel right.
        <br />
        <br />
        If it doesn’t help someone, what’s the point?
      </>
    ),
  },
  {
    title: "Let’s Make Cool Stuff",
    content: (
      <>
        I’m here to push boundaries, learn as much as I can, and have fun doing it.
        <br />
        <br />
        If you want to build something that makes people say “wow,” let’s talk.
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
