import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press Kit',
  description: 'Press information and media resources for Dalingcebo contemporary art',
}

export default function PressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
