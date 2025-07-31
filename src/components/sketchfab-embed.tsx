export function SketchfabEmbed() {
    return (
        <section className="py-16 px-4 bg-gray-100">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    My 3D Work
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
                    <p className="mt-4 text-sm text-gray-600 text-center">
                        <a
                            href="https://sketchfab.com/notreal/collections/mywork-ff58263bbe42472fb3d657a709d71d81"
                            target="_blank"
                            rel="nofollow"
                            className="font-bold text-blue-600 hover:text-blue-800"
                        >
                            mywork
                        </a>
                        {" "}by{" "}
                        <a
                            href="https://sketchfab.com/notreal"
                            target="_blank"
                            rel="nofollow"
                            className="font-bold text-blue-600 hover:text-blue-800"
                        >
                            not_really
                        </a>
                        {" "}on{" "}
                        <a
                            href="https://sketchfab.com?utm_source=website&utm_medium=embed&utm_campaign=share-popup"
                            target="_blank"
                            rel="nofollow"
                            className="font-bold text-blue-600 hover:text-blue-800"
                        >
                            Sketchfab
                        </a>
                    </p>
                </div>
            </div>
        </section>
    )
}