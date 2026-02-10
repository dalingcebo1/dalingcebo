export interface Catalog {
  id: string
  title: string
  description?: string
  pdfUrl: string
  coverImage?: string
  slug: string
  tags: string[]
  releaseDate?: string
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}
