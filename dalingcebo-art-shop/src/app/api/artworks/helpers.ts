import { Artwork, ArtworkScale } from '@/types/artwork';

const requiredFields: Array<keyof Artwork> = [
  'title',
  'artist',
  'price',
  'category',
  'scale',
  'size',
  'year',
  'medium',
  'description',
  'details',
  'edition',
  'image'
];

export function sanitizeArtworkPayload(data: Record<string, unknown>): Omit<Artwork, 'id'> {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const price = Number(data.price);
  const year = Number(data.year ?? new Date().getFullYear());
  const inventory = data.inventory !== undefined && data.inventory !== null ? Number(data.inventory) : undefined;

  if (Number.isNaN(price)) {
    throw new Error('Price must be a number');
  }

  if (Number.isNaN(year)) {
    throw new Error('Year must be a number');
  }

  if (inventory !== undefined && Number.isNaN(inventory)) {
    throw new Error('Inventory must be a number');
  }

  const scale = (data.scale as ArtworkScale) ?? 'large';
  const inStock = data.inStock === undefined ? true : Boolean(data.inStock);

  const tags = Array.isArray(data.tags)
    ? data.tags
    : typeof data.tags === 'string'
      ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : undefined;

  const images = Array.isArray(data.images) && data.images.length > 0
    ? data.images.map(String)
    : data.image
      ? [String(data.image)]
      : [];

  if (!images.length) {
    throw new Error('At least one image is required');
  }

  return {
    title: String(data.title),
    artist: String(data.artist),
    price,
    category: String(data.category),
    scale,
    size: String(data.size),
    year,
    medium: String(data.medium),
    description: String(data.description),
    details: String(data.details),
    inStock,
    edition: String(data.edition),
    image: String(data.image),
    images,
    tags,
    inventory,
  };
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY;

export function ensureAdminRequest(request: Request) {
  if (!ADMIN_KEY) {
    return;
  }
  const provided = request.headers.get('x-admin-key');
  if (!provided || provided !== ADMIN_KEY) {
    const error = new Error('Unauthorized');
    error.name = 'UNAUTHORIZED';
    throw error;
  }
}
