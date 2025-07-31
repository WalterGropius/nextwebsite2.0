"use client"

import { useEffect, useState, useRef } from "react"

interface PerformanceIssue {
  type: 'image' | 'animation' | 'threejs' | 'network'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
  metric?: number
}

export function PerformanceAnalysis() {
  const [issues, setIssues] = useState<PerformanceIssue[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  useEffect(() => {
    // Toggle visibility with Ctrl+Shift+A
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsVisible(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  useEffect(() => {
    if (!isVisible || analysisComplete) return

    const analyzePerformance = () => {
      const newIssues: PerformanceIssue[] = []

      // Analyze images
      const images = document.querySelectorAll('img')
      let totalImageSize = 0
      const largeImages: string[] = []

      images.forEach(img => {
        const src = img.src
        if (src.includes('image') && src.includes('.png')) {
          const match = src.match(/image(\d+)\.png/)
          if (match) {
            const num = parseInt(match[1])
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
            const size = sizeMap[num] || 1.0
            totalImageSize += size
            if (size > 2) {
              largeImages.push(`image${num}.png (${size}MB)`)
            }
          }
        }
      })

      if (totalImageSize > 50) {
        newIssues.push({
          type: 'image',
          severity: 'critical',
          description: `Total image size: ${Math.round(totalImageSize)}MB`,
          recommendation: 'Optimize images to WebP format, implement lazy loading, and use responsive images',
          metric: totalImageSize
        })
      } else if (totalImageSize > 20) {
        newIssues.push({
          type: 'image',
          severity: 'high',
          description: `Total image size: ${Math.round(totalImageSize)}MB`,
          recommendation: 'Consider optimizing large images and implementing lazy loading',
          metric: totalImageSize
        })
      }

      if (largeImages.length > 0) {
        newIssues.push({
          type: 'image',
          severity: 'medium',
          description: `Large images detected: ${largeImages.slice(0, 3).join(', ')}${largeImages.length > 3 ? '...' : ''}`,
          recommendation: 'Compress images above 2MB to reduce load times',
          metric: largeImages.length
        })
      }

      // Analyze Three.js usage
      const canvas = document.querySelector('canvas')
      if (canvas) {
        newIssues.push({
          type: 'threejs',
          severity: 'low',
          description: 'Three.js canvas detected',
          recommendation: 'Monitor GPU usage and consider reducing scene complexity if performance issues occur',
          metric: 1
        })
      }

      // Analyze network performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart
        if (ttfb > 600) {
          newIssues.push({
            type: 'network',
            severity: 'high',
            description: `TTFB: ${Math.round(ttfb)}ms (slow)`,
            recommendation: 'Optimize server response time or consider using a CDN',
            metric: ttfb
          })
        }
      }

      // Analyze Core Web Vitals
      const paint = performance.getEntriesByType('paint')
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime

      if (fcp && fcp > 2000) {
        newIssues.push({
          type: 'animation',
          severity: 'high',
          description: `FCP: ${Math.round(fcp)}ms (slow)`,
          recommendation: 'Reduce initial bundle size and optimize critical rendering path',
          metric: fcp
        })
      }

      if (lcp && lcp > 2500) {
        newIssues.push({
          type: 'animation',
          severity: 'critical',
          description: `LCP: ${Math.round(lcp)}ms (very slow)`,
          recommendation: 'Optimize largest contentful paint element (likely images)',
          metric: lcp
        })
      }

      setIssues(newIssues)
      setAnalysisComplete(true)
    }

    // Run analysis after a short delay to ensure page is loaded
    const timeout = setTimeout(analyzePerformance, 2000)
    return () => clearTimeout(timeout)
  }, [isVisible, analysisComplete])

  if (!isVisible) return null

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '📊'
    }
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg text-xs font-mono max-w-md max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Performance Analysis</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      {!analysisComplete ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Analyzing performance...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.length === 0 ? (
            <div className="text-green-400 text-center py-4">
              ✅ No performance issues detected!
            </div>
          ) : (
            issues.map((issue, index) => (
              <div key={index} className="border border-gray-600 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                  <span className={`font-semibold ${getSeverityColor(issue.severity)}`}>
                    {issue.type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(issue.severity)} bg-opacity-20`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm mb-2">{issue.description}</p>
                <p className="text-xs text-gray-400">{issue.recommendation}</p>
                {issue.metric && (
                  <p className="text-xs text-gray-500 mt-1">
                    Metric: {issue.metric}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400">
        Press Ctrl+Shift+A to toggle
      </div>
    </div>
  )
} 