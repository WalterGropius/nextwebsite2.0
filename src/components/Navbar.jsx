import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className='absolute inset-x-0 top-0 z-50 bg-white p-1 backdrop-blur-sm'>
      <div className='container mx-auto flex items-center justify-between'>
        <div className='text-lg font-bold text-black'>
          <Link href='/'>zenbauhaus</Link>
        </div>
        <div className='space-x-4'>
          <Link href='/portfolio' className='transition-duration-300 text-black hover:font-bold'>
            portfolio
          </Link>
          <Link href='/contact' className='transition-duration-300 text-black hover:font-bold'>
            reel
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
