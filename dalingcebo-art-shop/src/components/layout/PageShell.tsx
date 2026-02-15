import { ReactNode } from 'react'
import Breadcrumb from '@/components/Breadcrumb'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  maxWidth?: 'default' | 'narrow' | 'wide' | 'full'
}

/**
 * PageShell - Consistent layout wrapper for all pages
 * 
 * Provides:
 * - Max width: 1200px (configurable)
 * - Responsive padding: 16px mobile, 24px tablet, 32px desktop
 * - Section spacing: 32px mobile, 56px desktop
 * - Optional title, subtitle, and breadcrumbs
 */
export default function PageShell({
  children,
  title,
  subtitle,
  breadcrumbs,
  className = '',
  maxWidth = 'default',
}: PageShellProps) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'narrow':
        return 'max-w-4xl'
      case 'wide':
        return 'max-w-6xl'
      case 'full':
        return 'max-w-full'
      case 'default':
      default:
        return 'max-w-[1200px]'
    }
  }

  return (
    <div className={`page-shell ${className}`}>
      {/* Breadcrumbs section */}
      {breadcrumbs && (
        <section className="border-b border-gray-200 bg-white">
          <div className="page-shell-container py-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </section>
      )}

      {/* Title section (hero-style) */}
      {(title || subtitle) && (
        <section className="page-shell-hero bg-black text-white">
          <div className="page-shell-hero-content fade-in-slow">
            {title && (
              <h1 className="yeezy-main-logo text-white mb-8">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Main content */}
      <section className="page-shell-section">
        <div className={`page-shell-container ${getMaxWidth()}`}>
          {children}
        </div>
      </section>
    </div>
  )
}
