'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArtworkVideo } from '@/types/artwork'
import { StandaloneVideo } from '@/types/video'

interface VideoPlayerProps {
  video: ArtworkVideo | StandaloneVideo
  autoplay?: boolean
  onClose?: () => void
}

export default function VideoPlayer({ video, autoplay = false, onClose }: VideoPlayerProps) {
  // YouTube embed
  if (video.youtubeId) {
    return (
      <div className="relative w-full aspect-video bg-black">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
            aria-label="Close video"
          >
            ✕
          </button>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}${autoplay ? '?autoplay=1' : ''}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  // Supabase Storage video
  if (video.storageUrl) {
    return (
      <div className="relative w-full aspect-video bg-black">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white w-8 h-8 flex items-center justify-center hover:bg-opacity-75 transition-all"
            aria-label="Close video"
          >
            ✕
          </button>
        )}
        <video
          src={video.storageUrl}
          controls
          autoPlay={autoplay}
          className="w-full h-full"
          poster={video.thumbnailUrl}
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  return (
    <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-gray-500">
      No video available
    </div>
  )
}

// Video Gallery Component
interface VideoGalleryProps {
  videos: (ArtworkVideo | StandaloneVideo)[]
  featuredFirst?: boolean
}

export function VideoGallery({ videos, featuredFirst = true }: VideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<ArtworkVideo | StandaloneVideo | null>(null)

  const sortedVideos = [...videos].sort((a, b) => {
    if (featuredFirst) {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
    }
    // Handle optional sortOrder (fallback to 0 if not present)
    const aSortOrder = 'sortOrder' in a ? (a.sortOrder ?? 0) : 0
    const bSortOrder = 'sortOrder' in b ? (b.sortOrder ?? 0) : 0
    return aSortOrder - bSortOrder
  })

  if (videos.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVideos.map((video) => (
          <button
            key={video.id}
            onClick={() => setSelectedVideo(video)}
            className="group relative aspect-video bg-gray-100 overflow-hidden hover:opacity-90 transition-opacity"
          >
            {/* Thumbnail */}
            {video.thumbnailUrl ? (
              <Image
                src={video.thumbnailUrl}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
              <div className="w-16 h-16 rounded-full bg-black bg-opacity-75 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Featured Badge */}
            {video.isFeatured && (
              <div className="absolute top-2 left-2 bg-black text-white text-xs uppercase tracking-wide px-2 py-1">
                Featured
              </div>
            )}

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="text-white text-sm font-medium uppercase tracking-wide">
                {video.title}
              </div>
              {video.duration && (
                <div className="text-white text-xs opacity-75 mt-1">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoPlayer
              video={selectedVideo}
              autoplay={true}
              onClose={() => setSelectedVideo(null)}
            />
            <div className="mt-4 text-white">
              <h3 className="text-xl font-medium uppercase tracking-wide">
                {selectedVideo.title}
              </h3>
              {selectedVideo.description && (
                <p className="mt-2 text-gray-300">
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
