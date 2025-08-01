import { Navigation } from '@/components/navigation'

export default function CV() {
    return (
        <div>
            <Navigation />
            <iframe src="/cvBauer.html" className="w-full h-screen" />
            <div className="flex justify-center">
                <a href="/cvBauer.html" download className="bg-blue-500 text-white px-4 py-2 rounded-md">Download CV</a>
            </div>
        </div>
    )
}