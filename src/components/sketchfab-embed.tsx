export function SketchfabEmbed() {
    return (
        <section className="py-16 px-4 bg-gray-100">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Selected 3D Works
                </h2>
                <div className="flex flex-col items-center">
                    <iframe
                        width="640"
                        height="480"
                        src="https://sketchfab.com/playlists/embed?collection=ff58263bbe42472fb3d657a709d71d81&autostart=1"
                        title="mywork"
                        frameBorder="0"
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        className="w-full max-w-[640px] h-[480px] rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </section>
    )
}