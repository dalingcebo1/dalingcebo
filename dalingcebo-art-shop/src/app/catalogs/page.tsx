'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageShell from '@/components/layout/PageShell'
import { Catalog } from '@/types/catalog'
import { getArtworkPlaceholder } from '@/lib/media'

const CATALOG_PLACEHOLDER = getArtworkPlaceholder('card')

function getDownloadUrl(url: string): string {
  if (!url) return '#'
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const id = url.split('/file/d/')[1]?.split('/')[0]
    if (id) {
      return `https://drive.google.com/uc?export=download&id=${id}`
    }
  }
  return url
}

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadCatalogs() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/catalogs', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Unable to fetch catalogs')
        }
        const data: Catalog[] = await response.json()
        if (isMounted) {
          setCatalogs(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCatalogs()
    return () => {
      isMounted = false
    }
  }, [])

  const featuredCatalog = useMemo(() => catalogs.find((catalog) => catalog.isFeatured), [catalogs])
  const archive = useMemo(() => catalogs.filter((catalog) => !catalog.isFeatured), [catalogs])
  const featuredHasPdf = Boolean(featuredCatalog?.pdfUrl)
  const featuredDownloadHref = featuredHasPdf && featuredCatalog ? getDownloadUrl(featuredCatalog.pdfUrl) : '#'

  return (
    <main className="min-h-screen bg-white">
      <Header showBackButton={true} />

      <PageShell
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Catalogs' }]}
      >
        <div className="space-y-6 mb-12">
          <p className="meta uppercase text-gray-400">PDF Catalog Library</p>
          <h1 className="h1 yeezy-main-logo">Catalogs & Lookbooks</h1>
          <p className="body text-gray-600 max-w-2xl leading-relaxed">
            Curated drops, process essays, and seasonal lookbooks packaged for collectors. Download, archive, and share with your design teams.
          </p>
          <p className="meta uppercase text-gray-400">
            {catalogs.length} catalog{catalogs.length === 1 ? '' : 's'} available
          </p>
        </div>

        <div className="space-y-16">
          {isLoading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 text-center text-sm">
              {error}
            </div>
          )}

          {!isLoading && !error && featuredCatalog && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gradient-to-br from-gray-50 to-white">
                <Image
                  src={featuredCatalog.coverImage || CATALOG_PLACEHOLDER}
                  alt={featuredCatalog.title}
                  width={900}
                  height={1200}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="space-y-6">
                <p className="meta uppercase text-gray-500">Featured Release</p>
                <h2 className="h2">{featuredCatalog.title}</h2>
                {featuredCatalog.releaseDate && (
                  <p className="meta uppercase text-gray-500">
                    Released {new Date(featuredCatalog.releaseDate).toLocaleDateString()}
                  </p>
                )}
                {featuredCatalog.description && (
                  <p className="body text-gray-700 leading-relaxed">
                    {featuredCatalog.description}
                  </p>
                )}
                {featuredCatalog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {featuredCatalog.tags.map((tag) => (
                      <span key={tag} className="meta px-3 py-1 uppercase bg-gray-900 text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={featuredDownloadHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-yeezy-primary ${featuredHasPdf ? '' : 'opacity-40 pointer-events-none'}`}
                    aria-disabled={!featuredHasPdf}
                  >
                    Download PDF
                  </a>
                  <a
                    href={featuredHasPdf ? featuredCatalog.pdfUrl : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn-yeezy ${featuredHasPdf ? '' : 'opacity-40 pointer-events-none'}`}
                    aria-disabled={!featuredHasPdf}
                  >
                    View in Drive
                  </a>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="h2">Archive</h3>
                <span className="meta uppercase text-gray-500">
                  {archive.length} downloadable file{archive.length === 1 ? '' : 's'}
                </span>
              </div>
              {archive.length === 0 && !featuredCatalog && (
                <div className="text-center text-gray-500">No catalogs uploaded yet.</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(featuredCatalog ? [featuredCatalog, ...archive] : archive).map((catalog) => {
                  const hasPdf = Boolean(catalog.pdfUrl)
                  const downloadHref = hasPdf ? getDownloadUrl(catalog.pdfUrl) : '#'
                  return (
                  <article
                    key={catalog.id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col"
                  >
                    <div className="relative w-full bg-gray-50" style={{ aspectRatio: 3 / 4 }}>
                      <Image
                        src={catalog.coverImage || CATALOG_PLACEHOLDER}
                        alt={catalog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div>
                        <p className="meta uppercase text-gray-500 mb-1">
                          {catalog.releaseDate ? new Date(catalog.releaseDate).toLocaleDateString() : 'Unreleased'}
                        </p>
                        <h4 className="meta font-medium mb-1">{catalog.title}</h4>
                        {catalog.description && (
                          <p className="body text-gray-600 leading-relaxed">
                            {catalog.description}
                          </p>
                        )}
                      </div>
                      {catalog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {catalog.tags.map((tag) => (
                            <span key={tag} className="meta px-2 py-0.5 uppercase bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto flex flex-wrap gap-2">
                        <a
                          href={downloadHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn-yeezy-primary flex-1 text-center ${hasPdf ? '' : 'opacity-40 pointer-events-none'}`}
                          aria-disabled={!hasPdf}
                        >
                          Download
                        </a>
                        <a
                          href={hasPdf ? catalog.pdfUrl : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn-yeezy flex-1 text-center ${hasPdf ? '' : 'opacity-40 pointer-events-none'}`}
                          aria-disabled={!hasPdf}
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </article>
                )})}
              </div>
            </div>
          )}
        </div>
      </PageShell>

      <Footer />
    </main>
  )
}
