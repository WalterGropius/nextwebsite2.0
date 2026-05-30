'use client'

// Thin positioning wrapper for every page. This used to be a full-height
// `overflow: auto` scroll container (a leftover from the react-three-next
// starter), but because it wraps every route via the root layout it created
// a nested scroll region inside the document's own scroll — the classic
// "scroll within scroll" on every page. The site scrolls naturally on the
// body, so we only keep the relative positioning context here.
const Layout = ({ children }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {children}
    </div>
  )
}

export { Layout }
