import { Navigation } from '@/components/navigation'

export default function Reel() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="flex flex-1 items-center justify-center">
                <video
                    src="/reel_sm.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="
                        w-full h-full
                        object-cover
                        md:w-full md:h-auto md:max-h-[80vh] md:object-contain
                        sm:h-screen sm:w-auto
                    "
                    style={{
                        // On mobile: full height, chop sides (object-cover)
                        // On desktop: full width, max 80vh, show all (object-contain)
                    }}
                />
            </div>
        </div>
    )
}