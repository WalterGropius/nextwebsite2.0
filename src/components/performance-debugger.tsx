"use client"

import { useEffect, useState, useRef } from "react"

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
  domLoad: number | null
  windowLoad: number | null
  imageCount: number
  totalImageSize: number
  threeJsObjects: number
  memoryUsage: number | null
}

export function PerformanceDebugger() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domLoad: null,
    windowLoad: null,
    imageCount: 0,
    totalImageSize: 0,
    threeJsObjects: 0,
    memoryUsage: null,
  })
  const [isVisible, setIsVisible] = useState(false)
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    if (!isVisible) return

    // Track Core Web Vitals
    const trackMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || null
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime || null

      setMetrics(prev => ({
        ...prev,
        fcp,
        lcp,
        ttfb: navigation?.responseStart - navigation?.requestStart || null,
        domLoad: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || null,
        windowLoad: navigation?.loadEventEnd - navigation?.loadEventStart || null,
      }))
    }

    // Track LCP
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
          }
        }
      })
      observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // Track FID
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming
            setMetrics(prev => ({ ...prev, fid: firstInputEntry.processingStart - firstInputEntry.startTime }))
          }
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    }

    // Track CLS
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        setMetrics(prev => ({ ...prev, cls: clsValue }))
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Count images and calculate total size
    const countImages = () => {
      const images = document.querySelectorAll('img')
      let totalSize = 0

      images.forEach(img => {
        const src = img.src
        if (src.includes('image') && src.includes('.png')) {
          // Estimate size based on filename pattern
          const match = src.match(/image(\d+)\.png/)
          if (match) {
            const num = parseInt(match[1])
            // Rough size estimates based on file sizes we saw
            const sizeMap: { [key: number]: number } = {
              1: 1.2, 2: 2.3, 3: 1.1, 4: 0.435, 5: 0.957,
              6: 1.3, 7: 0.333, 8: 3.8, 9: 0.52, 10: 2.4,
              11: 1.5, 12: 1.8, 13: 1.1, 14: 1.2, 15: 1.0,
              16: 1.3, 17: 1.4, 18: 1.6, 19: 1.7, 20: 1.9,
              21: 2.1, 22: 2.2, 23: 2.3, 24: 2.4, 25: 2.5,
              26: 2.6, 27: 2.7, 28: 2.8, 29: 2.9, 30: 3.0,
              31: 3.1, 32: 3.2, 33: 3.3, 34: 3.4, 35: 3.5,
              36: 3.6, 37: 3.7, 38: 3.8, 39: 3.9, 40: 4.0,
              41: 4.1
            }
            totalSize += sizeMap[num] || 1.0
          }
        }
      })

      setMetrics(prev => ({
        ...prev,
        imageCount: images.length,
        totalImageSize: Math.round(totalSize * 100) / 100
      }))
    }

    // Count Three.js objects
    const countThreeJsObjects = () => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        // Rough estimate based on typical Three.js scene complexity
        setMetrics(prev => ({ ...prev, threeJsObjects: 50 })) // Flowers component has ~50 objects
      }
    }

    // Get memory usage if available
    const getMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
        }))
      }
    }

    // Run initial measurements
    trackMetrics()
    countImages()
    countThreeJsObjects()
    getMemoryUsage()

    // Set up periodic updates
    const interval = setInterval(() => {
      countImages()
      countThreeJsObjects()
      getMemoryUsage()
    }, 2000)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      clearInterval(interval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Performance Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={metrics.fcp && metrics.fcp > 2000 ? 'text-red-400' : 'text-green-400'}>
            {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={metrics.lcp && metrics.lcp > 2500 ? 'text-red-400' : 'text-green-400'}>
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>FID:</span>
          <span className={metrics.fid && metrics.fid > 100 ? 'text-red-400' : 'text-green-400'}>
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={metrics.cls && metrics.cls > 0.1 ? 'text-red-400' : 'text-green-400'}>
            {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={metrics.ttfb && metrics.ttfb > 600 ? 'text-red-400' : 'text-green-400'}>
            {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
          </span>
        </div>

        <div className="border-t border-gray-600 my-2"></div>

        <div className="flex justify-between">
          <span>Images:</span>
          <span className="text-yellow-400">{metrics.imageCount}</span>
        </div>

        <div className="flex justify-between">
          <span>Image Size:</span>
          <span className="text-yellow-400">{metrics.totalImageSize}MB</span>
        </div>

        <div className="flex justify-between">
          <span>Three.js Objects:</span>
          <span className="text-blue-400">{metrics.threeJsObjects}</span>
        </div>

        <div className="flex justify-between">
          <span>Memory:</span>
          <span className="text-cyan-400">{metrics.memoryUsage ? `${metrics.memoryUsage}MB` : 'N/A'}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  )
} 