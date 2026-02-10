export type UpdateCategory = 'news' | 'exhibition' | 'studio_update' | 'press';

export interface Update {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: UpdateCategory;
  tags: string[];
  author: string;
  published: boolean;
  publishedAt?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: string;
  unsubscribedAt?: string;
}
