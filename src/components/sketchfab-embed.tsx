export function SketchfabEmbed() {
    return (
        <section className="py-16 px-0 bg-gray-100 w-full">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 w-full">
                Selected 3D Works
            </h2>
            <div className="w-full flex justify-center">
                <iframe
                    src="https://sketchfab.com/playlists/embed?collection=ff58263bbe42472fb3d657a709d71d81&autostart=1"
                    title="mywork"
                    frameBorder="0"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    className="w-full h-[60vw] max-h-[80vh] min-h-[320px] rounded-lg shadow-lg"
                />
            </div>
        </section>
    )
}