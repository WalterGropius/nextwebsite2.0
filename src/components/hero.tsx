export function Hero() {
  return (
    <div className="flex items-center justify-center h-full relative">
      <div className="relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-3/5">
        <div className="flex flex-col items-start justify-center p-4 md:p-6 text-center md:w-2/5 md:text-left rounded-xl shadow-lg border" style={{ backgroundColor: 'rgba(58, 63, 106, 0.8)', borderColor: 'var(--vista-blue)' }}>
          <p className="w-full uppercase font-mono tracking-widest text-xs animate-fade-in-up animation-delay-500" style={{ color: 'var(--thistle)' }}>
            art & tech polymath
          </p>
          <h1 className="my-2 text-3xl md:text-5xl font-extrabold leading-tight animate-fade-in-up animation-delay-700" style={{ color: 'var(--flax)' }}>
            Eliáš Bauer
          </h1>
          <p className="mb-4 text-lg md:text-xl leading-normal animate-fade-in-up animation-delay-900" style={{ color: 'var(--pistachio)' }}>
            Lifelong learner driven by boundless curiosity
          </p>
          <div className="mt-1 flex flex-wrap gap-2 animate-fade-in-up animation-delay-1100">
            <span className="px-2 py-0.5 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor: 'var(--cobalt-blue)', color: 'var(--thistle)' }}>
              Creative Coder
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor: 'var(--lion)', color: 'var(--flax)' }}>
              Designer
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-semibold tracking-wide" style={{ backgroundColor: 'var(--vermilion)', color: 'var(--flax)' }}>
              Explorer
            </span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-gray-700 opacity-30" />
    </div>
  )
}