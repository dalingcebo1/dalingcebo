import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

function getEnv(name, fallback = '') {
  return process.env[name] || fallback
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'))

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function normalizeDrivePdfUrl(url) {
  if (!url) return url
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const id = url.split('/file/d/')[1]?.split('/')[0]
    if (id) {
      return `https://drive.google.com/uc?export=download&id=${id}`
    }
  }
  return url
}

async function upsertCatalog(entry) {
  const payload = {
    title: entry.title,
    description: entry.description ?? null,
    pdf_url: entry.pdfUrl ? normalizeDrivePdfUrl(entry.pdfUrl) : null,
    cover_image: entry.coverImage ?? null,
    slug: entry.slug,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    release_date: entry.releaseDate ?? null,
    is_featured: Boolean(entry.isFeatured),
  }

  const existing = await supabase
    .from('catalogs')
    .select('id')
    .eq('slug', payload.slug)
    .maybeSingle()

  if (existing.error && existing.error.code !== 'PGRST116') {
    throw existing.error
  }

  const mutation = existing.data
    ? supabase.from('catalogs').update(payload).eq('id', existing.data.id)
    : supabase.from('catalogs').insert(payload)

  const result = await mutation.select().single()

  if (result.error) {
    throw result.error
  }

  return result.data
}

async function main() {
  const filePath = path.resolve(__dirname, '..', 'data', 'catalogs.json')
  const raw = await fs.readFile(filePath, 'utf-8')
  const catalogs = JSON.parse(raw)

  console.log(`Syncing ${catalogs.length} catalog(s)...`)

  for (const entry of catalogs) {
    try {
      const saved = await upsertCatalog(entry)
      console.log(`✓ ${saved.title}`)
    } catch (error) {
      console.error(`✗ Failed to save ${entry.title}:`, error.message)
    }
  }

  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
