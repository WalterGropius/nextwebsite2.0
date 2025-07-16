'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PresentationControls, Float } from '@react-three/drei'
//import { EffectComposer, SSAO, Bloom, DepthOfField, Vignette, BrightnessContrast, HueSaturation } from '@react-three/postprocessing'

//import { MeshBasicMaterial } from 'three'
import { Splat } from '@react-three/drei'

export default function Page() {
  return (
    <>
      <div className='relative h-screen w-screen'>
        <Canvas>
          <ambientLight color={'white'} intensity={10} />
          <PresentationControls
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 1500 }}
            rotation={[0, 1, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Float>
              <Splat scale={3} rotation={[0, -0.7 * Math.PI, 0]} src='flowers_white.splat' />
            </Float>
          </PresentationControls>
        </Canvas>
        <div className='relative z-10 mx-auto flex w-full flex-col flex-wrap items-center md:flex-row lg:w-4/5'>
          {/* jumbo */}
          <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
            <p className='w-full uppercase'>art&tech polymath</p>
            <h1 className='my-4 text-5xl font-bold leading-tight'>zenbauhaus</h1>
            <p className='mb-8 text-2xl leading-normal'>lifelong learner driven by boundless curiosity</p>
          </div>
        </div>

        <div className='relative z-10 mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row lg:w-4/5'>
          {/* first row */}
          <div className='rounded-lg bg-white bg-opacity-50 p-6 backdrop-blur-md'>
            <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>with a profound passion</h2>
            <p className='mb-8 text-2xl text-black'>for the synergy of art and technology</p>
          </div>
          {/*  <div className='relative my-12 h-48 w-full py-6 sm:w-1/2 md:mb-40'>
            <Computer/>
          </div> */}
          {/* second row */}
          <div className='relative my-12 h-48 w-full py-6 sm:w-1/2 md:mb-40'></div>
          <div className=' rounded-lg bg-white bg-opacity-50 p-6 backdrop-blur-md'>
            <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>
              dedicated to being a bridge between creative vision and technical execution
            </h2>
            <p className='mb-8 text-lg text-gray-600'>
              whether supporting <span className='text-2xl font-bold'>artists</span> in making their{' '}
              <span className='text-2xl font-bold'>dreams</span> tangible or spicing up a simple technical query with a
              fresh idea,
            </p>
            <p className='mb-8 text-lg text-gray-600'>
              my heart lies at the crossroads of <span className='text-2xl font-bold'>imagination</span> and{' '}
              <span className='text-2xl font-bold'>innovation</span>.
            </p>
            <p className='mb-8 text-lg text-gray-600'>
              fortunate to work with both artistic and technical minds, continually learning the importance of
              <span className='text-2xl font-bold'> functionality</span>,{' '}
              <span className='text-2xl font-bold'>aesthetics</span> and{' '}
              <span className='text-2xl font-bold'>user experience</span>.
            </p>
            <p className='mb-8 text-lg text-gray-600'>
              every collaboration is an opportunity to unleash{' '}
              <span className='text-2xl font-bold'>visionary creativity</span> and{' '}
              <span className='text-2xl font-bold'>state of the art technology</span>.
            </p>
            <p className='mb-8 text-lg text-gray-600'>
              lets collaborate and bring new <span className='text-xl font-bold'>visions</span> to life together!
            </p>
            <p className='mb-8 text-lg text-gray-600'>
              Check out my{' '}
              <a href='/portfolio' className='text-blue-500 underline'>
                portfolio
              </a>{' '}
              to see more of my work.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
