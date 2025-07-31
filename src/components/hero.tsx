"use client"

export function Hero() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5">
        {/* Main content matching page.jsx */}
        <div className="flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left bg-gray-900/70 backdrop-blur-md rounded-xl">
          <p className="w-full uppercase text-amber-400 font-mono tracking-widest animate-fade-in-up animation-delay-500">
            art&tech polymath
          </p>

          <h1 className="my-4 text-5xl md:text-6xl font-bold leading-tight animate-fade-in-up animation-delay-700">
            zenbauhaus
          </h1>

          <p className="mb-8 text-2xl leading-normal text-gray-300 animate-fade-in-up animation-delay-900">
            lifelong learner driven by boundless curiosity
          </p>
        </div>
      </div>

      {/* Subtle gradient overlay  */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/90 pointer-events-none" />

    </div>
  )
}
