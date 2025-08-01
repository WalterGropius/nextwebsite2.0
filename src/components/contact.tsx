"use client"

import { useRef, useEffect, useState } from "react"
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react"

export function Contact() {
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
    <section id="contact" className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className={isInView ? "animate-fade-in" : "opacity-0"}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Collaborate</h2>

          <div className="text-center mb-16">
            <p
              className={`text-2xl mb-8 leading-relaxed ${isInView ? "animate-slide-up animation-delay-200" : "opacity-0"
                }`}
              style={{ color: 'var(--thistle)' }}
            >
              lets collaborate and bring new <span style={{ color: 'var(--flax)', fontWeight: 'bold' }}>visions</span> to life together!
            </p>

            <p
              className={`mb-8 text-lg ${isInView ? "animate-slide-up animation-delay-300" : "opacity-0"
                }`}
              style={{ color: 'var(--salmon-pink)' }}
            >
              Check out my{" "}
              <a href="/portfolio" style={{ color: 'var(--flax)' }} className="hover:opacity-80 underline transition-colors">
                portfolio
              </a>{" "}
              to see more of my work.
            </p>

            <div
              className={`flex justify-center gap-8 ${isInView ? "animate-slide-up animation-delay-400" : "opacity-0"
                }`}
            >
              <a
                href="mailto:zenbauhaus@gmail.com"
                className="group flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: 'var(--vermilion)', color: 'white' }}
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
            className={`flex flex-wrap justify-center gap-6 mb-8 ${isInView ? "animate-fade-in animation-delay-600" : "opacity-0"
              }`}
          >
            <a
              href="https://github.com/WalterGropius"
              className="p-3 transition-colors"
              style={{ color: 'var(--salmon-pink)' }}
              aria-label="GitHub"
              target="_blank" rel="noopener noreferrer"
            >
              <Github size={24} />
            </a>
            <a
              href="https://linkedin.com/in/zenbauhaus"
              className="p-3 transition-colors"
              style={{ color: 'var(--vista-blue)' }}
              aria-label="LinkedIn"
              target="_blank" rel="noopener noreferrer"
            >
              <Linkedin size={24} />
            </a>
            <a
              href="https://instagram.com/y4ngyin"
              className="p-3 transition-colors"
              style={{ color: 'var(--pistachio)' }}
              aria-label="Instagram y4ngyin"
              target="_blank" rel="noopener noreferrer"
            >
              <span className="font-bold">@y4ngyin</span>
            </a>
            <a
              href="https://instagram.com/tra5her_sk8"
              className="p-3 transition-colors"
              style={{ color: 'var(--lion)' }}
              aria-label="Instagram tra5her_sk8"
              target="_blank" rel="noopener noreferrer"
            >
              <span className="font-bold">@tra5her_sk8</span>
            </a>
            <a
              href="https://facebook.com/ezbawa"
              className="p-3 transition-colors"
              style={{ color: 'var(--thistle)' }}
              aria-label="Facebook ezbawa"
              target="_blank" rel="noopener noreferrer"
            >
              <span className="font-bold">/ezbawa</span>
            </a>
            <a
              href="https://soundcloud.com/mczenbauhaus"
              className="p-3 transition-colors"
              style={{ color: 'var(--flax)' }}
              aria-label="SoundCloud mczenbauhaus"
              target="_blank" rel="noopener noreferrer"
            >
              <span className="font-bold">/mczenbauhaus</span>
            </a>
          </div>

          <div
            className={`text-center text-sm ${isInView ? "animate-fade-in animation-delay-800" : "opacity-0"
              }`}
            style={{ color: 'var(--fern-green)' }}
          >
            Crafted by zenbauhaus. © 2024
          </div>
        </div>
      </div>
    </section>
  )
}
