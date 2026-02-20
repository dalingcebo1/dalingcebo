import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Common questions about purchasing, shipping, and caring for artwork',
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
