import { Navigation } from "@/components/navigation"

export default function SketchfabLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Navigation />
            {children}
        </div>
    )
}   