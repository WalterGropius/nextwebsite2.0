'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
import Modal from 'react-modal'

function PortfolioViewer() {
  const [portfolio, setPortfolio] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    fetch('/portfolio.json')
      .then((response) => response.json())
      .then((data) => setPortfolio(data))
  }, [])

  const openModal = (project) => {
    setSelectedProject(project)
  }

  const closeModal = () => {
    setSelectedProject(null)
  }

  return (
    <>
      <Canvas>
        <OrbitControls enableZoom={false} enablePan={false} />
        <ambientLight intensity={0.5} />
        {portfolio.map((item) => (
          <mesh
            key={item.title}
            position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]}
            onPointerOver={(e) => (e.stopPropagation(), e.target.scale.set(1.2, 1.2, 1.2))}
            onPointerOut={(e) => (e.stopPropagation(), e.target.scale.set(1, 1, 1))}
            onClick={() => openModal(item)}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={'orange'} />
          </mesh>
        ))}
      </Canvas>
      {selectedProject && (
        <Modal isOpen={true} onRequestClose={closeModal}>
          <h2>{selectedProject.title}</h2>
          <p>{selectedProject.date}</p>
          <p>{selectedProject.tags}</p>
          <p>{selectedProject.description}</p>
          <img src={selectedProject.image} alt={selectedProject.title} />
          <a href={selectedProject.link} target='_blank' rel='noopener noreferrer'>
            More Info
          </a>
          <button onClick={closeModal}>Close</button>
        </Modal>
      )}
    </>
  )
}

export default function Page() {
  return (
    <>
      <div className='relative h-screen w-screen'>
        <PortfolioViewer />
      </div>
    </>
  )
}
