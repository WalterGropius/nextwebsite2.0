"use client"

import { useRef, useEffect, useState } from "react"
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react"

export function Contact() {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1, rootMargin: "-100px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className={isInView ? "animate-fade-in" : "opacity-0"}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Collaborate</h2>

          <div className="text-center mb-16">
            <p
              className={`text-2xl text-gray-300 mb-8 leading-relaxed ${
                isInView ? "animate-slide-up animation-delay-200" : "opacity-0"
              }`}
            >
              lets collaborate and bring new <span className="text-amber-400 font-bold">visions</span> to life together!
            </p>

            <p
              className={`mb-8 text-lg text-gray-400 ${
                isInView ? "animate-slide-up animation-delay-300" : "opacity-0"
              }`}
            >
              Check out my{" "}
              <a href="/portfolio" className="text-amber-400 hover:text-amber-300 underline transition-colors">
                portfolio
              </a>{" "}
              to see more of my work.
            </p>

            <div
              className={`flex justify-center gap-8 ${
                isInView ? "animate-slide-up animation-delay-400" : "opacity-0"
              }`}
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
            </div>
          </div>

          <div
            className={`flex justify-center gap-6 mb-16 ${
              isInView ? "animate-fade-in animation-delay-600" : "opacity-0"
            }`}
          >
            <a href="#" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors" aria-label="GitHub">
              <Github size={24} />
            </a>
            <a href="#" className="p-3 text-gray-500 hover:text-cyan-400 transition-colors" aria-label="LinkedIn">
              <Linkedin size={24} />
            </a>
          </div>

          <div
            className={`text-center text-sm text-gray-600 ${
              isInView ? "animate-fade-in animation-delay-800" : "opacity-0"
            }`}
          >
            Crafted by zenbauhaus. © 2024
          </div>
        </div>
      </div>
    </section>
  )
}
