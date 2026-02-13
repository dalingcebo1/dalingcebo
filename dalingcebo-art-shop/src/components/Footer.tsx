import Link from 'next/link'

const footerLinks = [
  { label: 'Press', href: '/press' },
  { label: 'SUPPORT', href: '/contact' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Care', href: '/care' },
]

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="yeezy-container py-12 md:py-16">
        {/* Centered horizontal footer links */}
        <div className="max-w-5xl mx-auto">
          {/* Footer Links - 6-column by 1-row grid layout */}
          <div className="grid grid-cols-6 gap-4 md:gap-6 text-xs mb-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-gray-700 hover:text-black yeezy-body transition-colors uppercase tracking-wider text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Bottom - Copyright and legal - horizontally distributed */}
          <div className="border-t border-gray-200 pt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 yeezy-body">
            <p>© 2025 Dalingcebo</p>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
