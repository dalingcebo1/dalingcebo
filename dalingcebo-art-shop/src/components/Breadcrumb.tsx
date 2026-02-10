import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className={`text-[10px] uppercase tracking-[0.35em] ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-gray-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-black">{item.label}</span>
              )}
              {!isLast && <span aria-hidden className="text-gray-300">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
