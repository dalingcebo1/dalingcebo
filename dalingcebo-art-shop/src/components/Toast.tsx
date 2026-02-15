'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, X, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white'
  }

  const icons = {
    success: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
    error: <AlertCircle className="w-4 h-4" aria-hidden="true" />,
    warning: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
    info: <Info className="w-4 h-4" aria-hidden="true" />
  }

  return (
    <div className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`
        flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm
        ${typeStyles[type]} border border-white/20
      `}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-2 hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
