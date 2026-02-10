import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="yeezy-heading text-6xl md:text-8xl mb-4">404</h1>
        <p className="yeezy-subheading text-sm md:text-base text-gray-600 mb-2 tracking-[0.3em]">
          PAGE NOT FOUND
        </p>
        <p className="yeezy-body text-base text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-yeezy-primary">
            Browse Artworks
          </Link>
          <Link href="/" className="btn-yeezy">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
