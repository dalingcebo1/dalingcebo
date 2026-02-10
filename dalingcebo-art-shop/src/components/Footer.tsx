import Link from 'next/link'

const navigationLinks = [
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Press', href: '/press' },
]

const supportLinks = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Care', href: '/care' },
]

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="yeezy-container py-16 md:py-20">
        {/* Centered content */}
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Description */}
          <p className="yeezy-body text-base md:text-lg text-gray-700 leading-relaxed">
            Contemporary art that bridges cultures and speaks to the modern soul. Each piece crafted with intention and purpose.
          </p>

          {/* Navigation sections - horizontal layout */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {/* Navigation */}
            <div className="text-center">
              <h3 className="yeezy-title text-xs mb-4 tracking-[0.3em] text-gray-600">
                NAVIGATION
              </h3>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-700 hover:text-black yeezy-body transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="text-center">
              <h3 className="yeezy-title text-xs mb-4 tracking-[0.3em] text-gray-600">
                SUPPORT
              </h3>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {supportLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-700 hover:text-black yeezy-body transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom - Copyright and legal */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-500 yeezy-body">
            <p>© 2025 Dalingcebo</p>
            <span className="hidden md:inline">•</span>
            <Link href="/privacy" className="hover:text-black transition-colors">
              Privacy
            </Link>
            <span className="hidden md:inline">•</span>
            <Link href="/terms" className="hover:text-black transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
