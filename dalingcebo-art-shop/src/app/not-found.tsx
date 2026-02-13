import FallbackMessage from '@/components/FallbackMessage'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <FallbackMessage
        title="404"
        subtitle="PAGE NOT FOUND"
        description="The page you're looking for doesn't exist or has been moved."
        icon="notFound"
      />
    </div>
  )
}
