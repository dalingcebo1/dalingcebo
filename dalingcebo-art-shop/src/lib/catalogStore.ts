import { createServiceRoleClient } from '@/lib/db/supabase'
import { Catalog } from '@/types/catalog'

function mapRowToCatalog(row: any): Catalog {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    pdfUrl: row.pdf_url,
    coverImage: row.cover_image || undefined,
    slug: row.slug,
    tags: row.tags || [],
    releaseDate: row.release_date || undefined,
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function readCatalogs(): Promise<Catalog[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('release_date', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching catalogs:', error)
    return []
  }

  return (data || []).map(mapRowToCatalog)
}

export async function getCatalogBySlug(slug: string): Promise<Catalog | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('catalogs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return mapRowToCatalog(data)
}

export async function upsertCatalog(payload: Omit<Catalog, 'id' | 'createdAt' | 'updatedAt'>, id?: string): Promise<Catalog> {
  const supabase = createServiceRoleClient()
  const dbPayload = {
    title: payload.title,
    description: payload.description,
    pdf_url: payload.pdfUrl,
    cover_image: payload.coverImage,
    slug: payload.slug,
    tags: payload.tags,
    release_date: payload.releaseDate,
    is_featured: payload.isFeatured,
  }

  const query = supabase.from('catalogs')
  const response = id
    ? await query.update(dbPayload as never).eq('id', id).select().single()
    : await query.insert(dbPayload as never).select().single()

  if ((response as any).error || !(response as any).data) {
    throw new Error((response as any).error?.message ?? 'Unable to save catalog')
  }

  return mapRowToCatalog((response as any).data)
}

export async function deleteCatalog(id: string): Promise<void> {
  const supabase = createServiceRoleClient()
  const { error } = await supabase
    .from('catalogs')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
