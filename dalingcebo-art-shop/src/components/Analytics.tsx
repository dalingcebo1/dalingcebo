'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Analytics component for tracking page views
 * Supports Google Analytics, Plausible, or other analytics providers
 * 
 * To enable:
 * 1. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to .env for Google Analytics
 * 2. Or add NEXT_PUBLIC_PLAUSIBLE_DOMAIN to .env for Plausible
 */
export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

  // Track page views
  useEffect(() => {
    if (!pathname) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')

    // Google Analytics pageview
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      })
    }

    // Plausible pageview
    if (PLAUSIBLE_DOMAIN && typeof window !== 'undefined' && (window as any).plausible) {
      (window as any).plausible('pageview')
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID, PLAUSIBLE_DOMAIN])

  // Google Analytics
  if (GA_MEASUREMENT_ID) {
    return (
      <>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </>
    )
  }

  // Plausible Analytics (privacy-friendly alternative)
  if (PLAUSIBLE_DOMAIN) {
    return (
      <Script
        defer
        data-domain={PLAUSIBLE_DOMAIN}
        src="https://plausible.io/js/script.js"
      />
    )
  }

  // No analytics configured
  return null
}
