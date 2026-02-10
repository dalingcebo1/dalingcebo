import Script from 'next/script'

export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dalingcebo.art'
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DALINGCEBO',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@dalingcebo.art',
      contactType: 'Customer Service',
    },
  }

  const artGallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: 'DALINGCEBO Art Gallery',
    description: 'Contemporary art that bridges cultures and speaks to the modern soul',
    url: baseUrl,
    image: `${baseUrl}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Johannesburg',
      addressCountry: 'ZA',
    },
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="art-gallery-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(artGallerySchema),
        }}
      />
    </>
  )
}
