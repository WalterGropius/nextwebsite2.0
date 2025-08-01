import { Navigation } from '@/components/navigation'

export default function Art() {
    return (
        <div>
            <Navigation />
            <iframe src="/artBauer.pdf" className="w-full h-screen" />
        </div>
    )
}