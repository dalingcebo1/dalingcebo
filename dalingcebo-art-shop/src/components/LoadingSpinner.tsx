'use client'

import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'black' | 'white' | 'gray'
}

export default function LoadingSpinner({ size = 'md', color = 'black' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    black: 'border-black border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent'
  }

  return (
    <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}></div>
  )
}

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gradient mb-4">
            DALINGCEBO
          </h1>
          <div className="w-24 h-1 bg-black mx-auto"></div>
        </div>
        <LoadingSpinner size="lg" />
        <p className="mt-8 text-gray-600 tracking-wider uppercase text-sm">
          Loading Masterpieces...
        </p>
      </div>
    </div>
  )
}

export function ImageSkeleton() {
  return (
    <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
      <div className="skeleton w-full h-full"></div>
    </div>
  )
}
