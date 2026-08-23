import type React from "react"

// The hero's gaussian-splat scene. Each theme pulls a different capture —
// flowers for light, the nebula for dark — and they are 4MB and 2MB, so
// preloading both would double the hero's cost for every visitor. The
// theme only resolves on the client (next-themes, `attribute="class"`,
// `defaultTheme="system"`), so this reads the same localStorage key the
// provider writes and injects a preload for the one capture that will
// actually be rendered. Worst case the guess is stale and the browser
// fetches the other file a moment later, exactly as it would today.
const PRELOAD_SPLAT = `(function(){try{
var t=localStorage.getItem('theme');
if(!t||t==='system'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
var l=document.createElement('link');
l.rel='preload';l.as='fetch';l.crossOrigin='anonymous';
l.href=t==='dark'?'/splat_dark.sog':'/flowers_white.sog';
document.head.appendChild(l)}catch(e){}})()`

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PRELOAD_SPLAT }} />
      {children}
    </>
  )
}
