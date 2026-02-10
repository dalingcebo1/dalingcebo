'use client'

import { useEffect } from 'react'

/**
 * Performance Monitoring Component
 * 
 * Tracks Core Web Vitals and sends them to analytics
 * Supports both Google Analytics and custom endpoints
 */
export default function PerformanceMonitoring() {
  useEffect(() => {
    // Only run in production and in the browser
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
      return
    }

    // Function to send metrics to analytics
    const sendToAnalytics = (metric: any) => {
      const body = JSON.stringify(metric)
      
      // Send to Google Analytics if available
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        })
      }

      // Send to custom endpoint if configured
      if (process.env.NEXT_PUBLIC_VITALS_ENDPOINT) {
        const url = process.env.NEXT_PUBLIC_VITALS_ENDPOINT
        
        // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, body)
        } else {
          fetch(url, { body, method: 'POST', keepalive: true })
        }
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance]', metric.name, Math.round(metric.value), metric)
      }
    }

    // Track Core Web Vitals manually or via Next.js built-in reporting
    // To enable web-vitals tracking:
    // 1. Install: npm install web-vitals
    // 2. Uncomment the code below
    
    /*
    import('web-vitals')
      .then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
        onCLS(sendToAnalytics)
        onFID(sendToAnalytics)
        onFCP(sendToAnalytics)
        onLCP(sendToAnalytics)
        onTTFB(sendToAnalytics)
        onINP(sendToAnalytics)
      })
      .catch(() => {
        console.log('web-vitals not available')
      })
    */
    
    // For now, use Next.js built-in web vitals reporting
    // This will be reported via reportWebVitals in _app.tsx if configured
  }, [])

  return null
}
