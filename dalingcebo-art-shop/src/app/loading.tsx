import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="yeezy-subheading text-xs mt-4 text-gray-500 tracking-[0.3em]">
          LOADING
        </p>
      </div>
    </div>
  )
}
