import Link from 'next/link'

interface FallbackMessageProps {
  title: string
  subtitle?: string
  description: string
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  icon?: 'error' | 'notFound' | 'empty'
  className?: string
}

export default function FallbackMessage({
  title,
  subtitle,
  description,
  primaryAction = { label: 'Browse Artworks', href: '/shop' },
  secondaryAction = { label: 'Return Home', href: '/' },
  icon = 'notFound',
  className = ''
}: FallbackMessageProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'error':
        return (
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'empty':
        return (
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        )
      case 'notFound':
      default:
        return (
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )
    }
  }

  const renderButton = (action: { label: string; href?: string; onClick?: () => void }, isPrimary: boolean) => {
    const buttonClasses = isPrimary
      ? 'px-8 py-3 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'
      : 'px-8 py-3 border border-gray-300 rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:border-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'

    if (action.href) {
      return (
        <Link href={action.href} className={buttonClasses} aria-label={action.label}>
          {action.label}
        </Link>
      )
    }

    if (action.onClick) {
      return (
        <button onClick={action.onClick} className={buttonClasses} aria-label={action.label}>
          {action.label}
        </button>
      )
    }

    return null
  }

  return (
    <div className={`min-h-[60vh] flex items-center justify-center px-4 text-center ${className}`}>
      <div className="max-w-md w-full">
        <div className="mb-8">
          {renderIcon()}
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3 text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">{subtitle}</p>
          )}
          <p className="text-gray-600 text-base leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryAction && renderButton(primaryAction, true)}
          {secondaryAction && renderButton(secondaryAction, false)}
        </div>
      </div>
    </div>
  )
}
