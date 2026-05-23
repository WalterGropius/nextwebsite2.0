"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">
}

export function MotionPermission() {
  const [show, setShow] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const Ctor = DeviceOrientationEvent as
      | DeviceOrientationEventStatic
      | undefined
    if (!Ctor || typeof Ctor.requestPermission !== "function") return
    if (sessionStorage.getItem("motion-permission-asked")) return

    const t = window.setTimeout(() => setShow(true), 1800)
    return () => window.clearTimeout(t)
  }, [])

  // CRITICAL: requestPermission must be called synchronously inside the
  // click handler, no awaits before it. Then await the returned promise.
  const onEnable: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    const Ctor = DeviceOrientationEvent as
      | DeviceOrientationEventStatic
      | undefined
    if (!Ctor?.requestPermission) {
      setShow(false)
      return
    }
    setRequesting(true)
    sessionStorage.setItem("motion-permission-asked", "1")

    const promise = Ctor.requestPermission()
    promise
      .then((result) => {
        if (result === "granted") {
          window.dispatchEvent(new CustomEvent("motion-permission-granted"))
        }
      })
      .catch(() => {
        /* user denied — pointer parallax still works */
      })
      .finally(() => {
        setRequesting(false)
        setShow(false)
      })
  }

  const onSkip = () => {
    sessionStorage.setItem("motion-permission-asked", "1")
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
          style={{
            background: "rgba(246, 246, 244, 0.95)",
            backdropFilter: "blur(20px) saturate(110%)",
            WebkitBackdropFilter: "blur(20px) saturate(110%)",
            border: "1.5px solid var(--ink)",
            fontFamily: "var(--font-display)",
          }}
        >
          <span
            className="text-sm"
            style={{ color: "var(--ink)", lineHeight: 1.3 }}
          >
            tilt to move it · enable motion?
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onSkip}
              className="px-2 py-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              skip
            </button>
            <button
              onClick={onEnable}
              disabled={requesting}
              className="rounded-full px-3 py-1 text-xs"
              style={{
                background: "var(--ink)",
                color: "var(--surface-dark)",
              }}
            >
              {requesting ? "…" : "enable"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
