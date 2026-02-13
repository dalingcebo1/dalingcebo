import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArtworkById } from '@/lib/artworkStore'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { VideoGallery } from '@/components/VideoPlayer'
import ArtworkImageGallery from './_components/ArtworkImageGallery'
import ArtworkActions from './_components/ArtworkActions'
import RelatedArtworks from './_components/RelatedArtworks'

// Parse and validate ID
function parseArtworkId(id: string): number {
  const parsed = parseInt(id, 10)
  if (isNaN(parsed) || parsed <= 0) {
    return -1 // Invalid ID
  }
  return parsed
}

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const artworkId = parseArtworkId(id)
  
  if (artworkId === -1) {
    return {
      title: 'Artwork Not Found | DALINGCEBO',
    }
  }

  const artwork = await getArtworkById(artworkId)
  
  if (!artwork) {
    return {
      title: 'Artwork Not Found | DALINGCEBO',
    }
  }

  const primaryImage = getArtworkPrimaryImage(artwork)

  return {
    title: `${artwork.title} by ${artwork.artist} | DALINGCEBO`,
    description: artwork.description,
    openGraph: {
      title: `${artwork.title} by ${artwork.artist}`,
      description: artwork.description,
      images: [
        {
          url: primaryImage,
          alt: artwork.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${artwork.title} by ${artwork.artist}`,
      description: artwork.description,
      images: [primaryImage],
    },
  }
}

// Server Component
export default async function ArtworkDetail(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artworkId = parseArtworkId(id)

  // Handle invalid ID format
  if (artworkId === -1) {
    notFound()
  }

  // Fetch artwork server-side
  const artwork = await getArtworkById(artworkId)

  // Handle missing artwork
  if (!artwork) {
    notFound()
  }

  // Prepare image list
  const imageList = artwork.images && artwork.images.length > 0 
    ? artwork.images.filter(Boolean)
    : [getArtworkPrimaryImage(artwork)]

  const heroAspectRatio = getArtworkAspectRatio(artwork.size)

  return (
    <main className="min-h-screen">
      <Header showBackButton />
      
      {/* Hero Section with Artwork Title */}
      <section className="yeezy-hero" style={{ height: '40vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
              {artwork.title}
            </h1>
          </div>
          <div className="fade-in-slow" style={{ animationDelay: '0.6s' }}>
            <p className="yeezy-body text-gray-600">
              {artwork.artist} • {artwork.year}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="yeezy-section">
        <div className="yeezy-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery (Client Component) */}
            <ArtworkImageGallery 
              images={imageList}
              title={artwork.title}
              aspectRatio={heroAspectRatio}
            />

            {/* Details and Actions (Client Component) */}
            <ArtworkActions artwork={artwork} />
          </div>

          {/* Videos Section */}
          {artwork.videos && artwork.videos.length > 0 && (
            <div className="border-t border-gray-200 mt-20 pt-16">
              <div className="mb-12">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Studio Footage</p>
                <h2 className="yeezy-heading text-3xl md:text-4xl">Process & Installation</h2>
              </div>
              <VideoGallery videos={artwork.videos} />
            </div>
          )}

          {/* Related Artworks (Client Component) */}
          <RelatedArtworks currentArtwork={artwork} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
