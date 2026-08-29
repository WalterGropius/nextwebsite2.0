'use client'

import { MotionConfig } from 'motion/react'

// Thin positioning wrapper for every page. This used to be a full-height
// `overflow: auto` scroll container (a leftover from the react-three-next
// starter), but because it wraps every route via the root layout it created
// a nested scroll region inside the document's own scroll — the classic
// "scroll within scroll" on every page. The site scrolls naturally on the
// body, so we only keep the relative positioning context here.
//
// MotionConfig reducedMotion="user": every motion/react animation on the
// site (staggered headlines, scroll parallax, card springs) collapses to
// simple opacity changes when the visitor asks the OS for reduced motion.
// One line here beats auditing ~30 components — and it doubles as a
// performance valve, since reduced-motion devices skip all transform work.
const Layout = ({ children }) => {
  return (
    <MotionConfig reducedMotion='user'>
      <div style={{ position: 'relative', width: '100%' }}>
        {children}
      </div>
    </MotionConfig>
  )
}

export { Layout }
