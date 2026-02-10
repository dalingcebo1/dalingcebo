import { NextResponse } from 'next/server'
import { readCatalogs, upsertCatalog } from '@/lib/catalogStore'
import { ensureAdminRequest } from '../artworks/helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CatalogPayload {
  title: string
  description?: string
  pdfUrl: string
  coverImage?: string
  slug: string
  tags?: string[]
  releaseDate?: string
  isFeatured?: boolean
}

function sanitizeCatalogPayload(data: Record<string, unknown>): CatalogPayload {
  const title = String(data.title ?? '').trim()
  const pdfUrl = String(data.pdfUrl ?? data.pdf_url ?? '').trim()
  const slug = String(data.slug ?? '').trim()

  if (!title || !pdfUrl || !slug) {
    throw new Error('Catalogs require title, pdfUrl, and slug fields')
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : typeof data.tags === 'string'
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : []

  return {
    title,
    description: data.description ? String(data.description) : undefined,
    pdfUrl,
    coverImage: data.coverImage ? String(data.coverImage) : data.cover_image ? String(data.cover_image) : undefined,
    slug,
    tags,
    releaseDate: data.releaseDate ? String(data.releaseDate) : data.release_date ? String(data.release_date) : undefined,
    isFeatured: data.isFeatured === undefined ? Boolean(data.is_featured) : Boolean(data.isFeatured),
  }
}

export async function GET() {
  try {
    const catalogs = await readCatalogs()
    return NextResponse.json(catalogs)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch catalogs'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    ensureAdminRequest(request)
    const payload = sanitizeCatalogPayload(await request.json())
    const created = await upsertCatalog({ ...payload, tags: payload.tags ?? [], isFeatured: payload.isFeatured ?? false })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create catalog'
    const lower = message.toLowerCase()
    const status = lower.includes('unauthorized') ? 401 : lower.includes('require') ? 400 : 500
    return NextResponse.json({ message }, { status })
  }
}
