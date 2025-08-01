import { Navigation } from '@/components/navigation'

export default function Reel() {
    return (
        <div>
            <Navigation />
            <video src="/reel_sm.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover z-0" />
        </div>
    )
}