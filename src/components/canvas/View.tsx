'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, ReactNode } from 'react'
import { OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'

interface CommonProps {
    color?: string
}

export const Common = ({ color }: CommonProps) => (
    <Suspense fallback={null}>
        {color && <color attach='background' args={[color]} />}
        <ambientLight />
        <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
        <pointLight position={[-10, -10, -10]} color='blue' decay={0.2} />
        <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
    </Suspense>
)

interface ViewProps {
    children: ReactNode
    orbit?: boolean
    className?: string
    [key: string]: any
}

const View = forwardRef<any, ViewProps>(({ children, orbit, ...props }, ref) => {
    const localRef = useRef(null)
    useImperativeHandle(ref, () => localRef.current)

    return (
        <>
            <div ref={localRef} {...props} />
            <Three>
                <ViewImpl track={localRef}>
                    {children}
                    {orbit && <OrbitControls />}
                </ViewImpl>
            </Three>
        </>
    )
})
View.displayName = 'View'

export { View } 