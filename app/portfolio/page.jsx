'use client'

import * as THREE from 'three'
import { Mesh, PlaneGeometry } from 'three'
import { useLayoutEffect, useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import {
  Image,
  ScrollControls,
  useScroll,
  Billboard,
  Text,
  Stars,
  Environment,
  MeshReflectorMaterial,
  MeshDistortMaterial,
  MeshRefractionMaterial,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import { suspend } from 'suspend-react'
import { easing, geometry } from 'maath'
import portfolioData from '../../public/portfolio.json'
import { RoundedBox } from '@react-three/drei'

extend(geometry)
extend({ PlaneGeometry })
const inter = import('@pmndrs/assets/fonts/inter_regular.woff')
const bridge = import('@pmndrs/assets/hdri/dawn.exr.js')
export default function Page() {
  return (
    <Canvas dpr={[1, 1.5]} style={{ overflow: 'none' }}>
      <ScrollControls pages={4} infinite>
        <Scene position={[0, 1.5, 0]} />
        <Environment
          files={suspend(bridge).default}
          background={true}
          backgroundIntensity={0}
          backgroundBlurriness={0.4}
        />
      </ScrollControls>
    </Canvas>
  )

  function Scene({ children, ...props }) {
    const ref = useRef()
    const scroll = useScroll()
    const [hovered, setHovered] = useState(null)

    const [selected, setSelected] = useState(null)
    const [isModalBig, setIsModalBig] = useState(false)

    useFrame((state, delta) => {
      ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
      state.events.update() // Raycasts every frame rather than on pointer-move
      easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9], 0.3, delta)
      state.camera.lookAt(0, 0, 0)
    })

    const handlePointerOver = useCallback(
      (index) => {
        if (!isModalBig) setHovered(index)
      },
      [isModalBig],
    )

    const handlePointerOut = useCallback(() => {
      console.log('hoverout')
    }, [isModalBig])

    const handleClick = useCallback(() => {
      if (hovered !== null) {
        setSelected(portfolioData[hovered])
        setIsModalBig(true)
      }
    }, [hovered])

    const handleClickAway = useCallback(() => {
      setIsModalBig(false)
      setSelected(null)
    }, [])

    return (
      <group ref={ref} {...props}>
        <Cards
          category=''
          from={0}
          len={Math.PI / 4}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
          data={portfolioData}
          isModalBig={isModalBig}
        />
        <ActiveCard
          hovered={hovered !== null ? portfolioData[hovered] : null} // Pass the correct data
          selected={selected}
          setSelected={setSelected}
          isModalBig={isModalBig}
          setIsModalBig={setIsModalBig}
          onClickAway={handleClickAway}
        />
      </group>
    )
  }

  function Cards({
    category,
    data,
    from = 0,
    len = Math.PI * 2,
    radius = 5.25,
    onPointerOver,
    onPointerOut,
    onClick,
    isModalBig,
    ...props
  }) {
    const [hovered, setHovered] = useState(null)
    const amount = len * 6
    const textPosition = from + (amount / 2 / amount) * len

    return (
      <group {...props}>
        <Billboard position={[Math.sin(textPosition) * radius * 1.4, 0.5, Math.cos(textPosition) * radius * 1.4]}>
          <Text font={suspend(inter).default} fontSize={0.25} anchorX='center' color='white'>
            {category}
          </Text>
        </Billboard>
        {data.map((item, i) => {
          const angle = from + (i / amount) * len
          return (
            <Card
              key={item.id}
              onPointerOver={(e) => (e.stopPropagation(), setHovered(i), onPointerOver(i))}
              onPointerOut={() => (setHovered(null), onPointerOut(null))}
              onClick={() => onClick(item)}
              position={[Math.sin(angle) * radius, isModalBig ? -5 : 0, Math.cos(angle) * radius]}
              rotation={[0, Math.PI / 2 + angle, 0]}
              active={hovered !== null}
              hovered={hovered === i}
              url={item.image}
              isModalBig={isModalBig}
            />
          )
        })}
      </group>
    )
  }

  function Card({ url, active, hovered, onClick, isModalBig, ...props }) {
    const ref = useRef()
    useFrame((state, delta) => {
      const f = hovered ? 1.4 : active ? 1.25 : 1
      easing.damp3(ref.current.position, [0, hovered ? 0.25 : 0, 0], 0.1, delta)

      ref.current.material.opacity = isModalBig ? 0.3 : 1
    })
    return (
      <group {...props} onClick={onClick}>
        <Image ref={ref} transparent radius={0.075} url={url || ''} scale={[1.618, 1, 1]} side={THREE.DoubleSide} />
      </group>
    )
  }

  function ActiveCard({ hovered, selected, setSelected, isModalBig, setIsModalBig, onClickAway, ...props }) {
    const ref = useRef()
    const [hoveredImage, setHoveredImage] = useState(false)
    const handleClickAway = () => {
      setIsModalBig(false)
      setSelected(null)
    }

    const handleClick = () => {
      setIsModalBig(true)
      setSelected(hovered)
    }

    useFrame((state, delta) => {
      if (ref.current) {
        easing.damp(ref.current.material, 'zoom', 1, 0.5, delta)
        easing.damp(ref.current.material, 'opacity', hovered !== null, 0.3, delta)
      }
    })

    return (
      <Billboard {...props}>
        {selected && (
          <>
            <Text
              font={suspend(inter).default}
              color={'black'}
              fontSize={0.4}
              position={[0, -1.5, 1]}
              anchorX='center'
              padding={[0.1, 0.2]} // Add padding
              maxWidth={5} // Set maxWidth to control text wrapping
              outlineColor={'white'}
              outlineOpacity={0.3}
              outlineBlur={0.7}
              outlineWidth={0.02}
            >
              {selected.description}
            </Text>
            {selected.link && (
              <Text
                font={suspend(inter).default}
                fontSize={0.3}
                position={[0, -3.5, 1]}
                anchorX='right'
                color='black'
                maxWidth={5}
                outlineColor={'white'}
                outlineOpacity={0.3}
                outlineBlur={0.7}
                outlineWidth={0.02}
                onClick={() => window.open(selected.link, '_blank')}
                onPointerEnter={(e) => {
                  e.object.scale.set(1.1, 1.1, 1.1)
                  e.object.rotation.z = 0.05
                }}
                onPointerLeave={(e) => {
                  e.object.scale.set(1, 1, 1)
                  e.object.rotation.z = 0
                }}
              >
                See more...
              </Text>
            )}
            <group onClick={handleClickAway}>
              <Image
                ref={ref}
                transparent
                radius={0.3}
                position={[0, 0, 0]}
                scale={[7, 7, 1]}
                url={selected.image || ''}
                side={THREE.DoubleSide}
                alt={selected.title}
                onPointerEnter={() => setHoveredImage(true)}
                onPointerLeave={() => setHoveredImage(false)}
              />

              <Text
                font={suspend(inter).default}
                fontSize={1}
                position={[-3, 3, 0.2]}
                anchorX='center'
                anchorY='middle'
                color='black'
                outlineColor={'white'}
                outlineOpacity={0.3}
                outlineBlur={0.7}
                outlineWidth={0.02}
                onPointerEnter={(e) => {
                  e.object.scale.set(1.1, 1.1, 1.1)
                  e.object.rotation.z = 0.05
                }}
                onPointerLeave={(e) => {
                  e.object.scale.set(1, 1, 1)
                  e.object.rotation.z = 0
                }}
              >
                {'<'}
              </Text>
            </group>
          </>
        )}
        {hovered !== null && !selected && (
          <>
            <Text
              font={suspend(inter).default}
              fontSize={0.5}
              position={[0, 3, 0]}
              anchorX='center'
              color='white'
              maxWidth={5} // Set maxWidth to control text wrapping
            >
              {hovered.title}
            </Text>
            <Image
              transparent
              radius={0.3}
              position={[0, 0, -1]}
              scale={[3, 3, 1]}
              url={hovered.image || ''}
              side={THREE.DoubleSide}
              alt={hovered.title}
              onClick={handleClick}
            />
          </>
        )}
      </Billboard>
    )
  }
}
