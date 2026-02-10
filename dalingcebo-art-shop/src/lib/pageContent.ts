import { createClient } from '@/lib/supabase/client'

export interface PageContent {
  id: string
  page_key: string
  section_key: string
  content_key: string
  content_text: string
  content_type: 'text' | 'html' | 'markdown'
  is_published: boolean
  sort_order: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Fetch page content from Supabase
 * @param pageKey - The page identifier (e.g., 'home', 'about', 'footer')
 * @param sectionKey - Optional section key to filter by
 * @returns Array of page content items
 */
export async function getPageContent(
  pageKey: string,
  sectionKey?: string
): Promise<PageContent[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from('page_content')
      .select('*')
      .eq('page_key', pageKey)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (sectionKey) {
      query = query.eq('section_key', sectionKey)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching page content:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error in getPageContent:', err)
    return []
  }
}

/**
 * Get a single content item by its keys
 * @param pageKey - The page identifier
 * @param sectionKey - The section identifier
 * @param contentKey - The content identifier
 * @returns The content text or null if not found
 */
export async function getContentItem(
  pageKey: string,
  sectionKey: string,
  contentKey: string
): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('page_content')
      .select('content_text')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('content_key', contentKey)
      .eq('is_published', true)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return (data as { content_text: string }).content_text
  } catch (err) {
    console.error('Error in getContentItem:', err)
    return null
  }
}

/**
 * Helper to organize content by section
 * @param content - Array of page content items
 * @returns Object with sections as keys and content arrays as values
 */
export function organizeContentBySections(
  content: PageContent[]
): Record<string, Record<string, string>> {
  return content.reduce((acc, item) => {
    if (!acc[item.section_key]) {
      acc[item.section_key] = {}
    }
    acc[item.section_key][item.content_key] = item.content_text
    return acc
  }, {} as Record<string, Record<string, string>>)
}
