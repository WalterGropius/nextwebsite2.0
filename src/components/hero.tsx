export function Hero() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-3/5">
        <div className="flex flex-col items-start justify-center p-4 md:p-6 text-center md:w-2/5 md:text-left bg-gray-900/70 rounded-xl shadow-lg border border-gray-800">
          <p className="w-full uppercase text-amber-500 font-mono tracking-widest text-xs animate-fade-in-up animation-delay-500">
            art & tech polymath
          </p>
          <h1 className="my-2 text-3xl md:text-5xl font-extrabold leading-tight animate-fade-in-up animation-delay-700 text-gray-100">
            Eliáš Bauer
          </h1>
          <p className="mb-4 text-lg md:text-xl leading-normal text-gray-300 animate-fade-in-up animation-delay-900">
            Lifelong learner driven by boundless curiosity
          </p>
          <div className="mt-1 flex flex-wrap gap-2 animate-fade-in-up animation-delay-1100">
            <span className="px-2 py-0.5 rounded bg-blue-700 text-blue-100 text-xs font-semibold tracking-wide">
              Creative Coder
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-600 text-amber-100 text-xs font-semibold tracking-wide">
              Designer
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-emerald-100 text-xs font-semibold tracking-wide">
              Explorer
            </span>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 pointer-events-none" />
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gray-700 opacity-30" />
    </div>
  )
}