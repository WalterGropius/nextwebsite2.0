import type { Metadata, Viewport } from 'next'
import { Layout } from '@/components/dom/Layout'
import '@/global.css'

export const metadata: Metadata = {
    title: 'zenbauhaus - Art & Tech Polymath',
    description: 'Lifelong learner driven by boundless curiosity. Bridging creative vision and technical execution.',
    keywords: ['creative technology', 'digital art', 'web development', '3D graphics', 'innovation'],
    authors: [{ name: 'zenbauhaus' }],
    creator: 'zenbauhaus',
    robots: 'index, follow',
    openGraph: {
        title: 'zenbauhaus - Art & Tech Polymath',
        description: 'Lifelong learner driven by boundless curiosity',
        type: 'website',
    },
    generator: 'Next.js',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#fbbf24',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className='antialiased'>
            <body>
                <Layout>{children}</Layout>
            </body>
        </html>
    )
} 