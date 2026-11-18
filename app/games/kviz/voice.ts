"use client"

// Speech recognition via the browser's Web Speech API (Chrome, Edge, Safari):
// free and on-device/OS-provided, so speaking answers costs nothing. Firefox
// lacks it — `supported` is false and the UI falls back to typing.

import { useCallback, useEffect, useRef, useState } from "react"

export function useSpeech(lang = "cs-CZ") {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState("")
  const rec = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const listen = useCallback((onFinal: (text: string, alternatives: string[]) => void) => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    rec.current?.abort()
    const r = new SR(); rec.current = r
    r.lang = lang; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false
    setHeard(""); setListening(true)
    r.onresult = (e: any) => {
      const res = e.results[e.results.length - 1]
      setHeard(res[0].transcript)
      if (res.isFinal) onFinal(res[0].transcript, Array.from(res as ArrayLike<any>).map((x: any) => x.transcript))
    }
    r.onerror = () => setListening(false)
    r.onend = () => setListening(false)
    r.start()
  }, [lang])

  const stop = useCallback(() => { rec.current?.stop(); setListening(false) }, [])
  useEffect(() => () => rec.current?.abort(), [])
  return { supported, listening, heard, listen, stop }
}
