'use client'

import { useEffect, useState } from 'react'

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
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`
        flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm
        ${typeStyles[type]} border border-white/20
      `}>
        <span className="text-lg">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-2 text-lg hover:scale-110 transition-transform"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  const showToast = (message: string, type: ToastProps['type'] = 'info', duration = 3000) => {
    setToast({ message, type, duration, onClose: () => setToast(null) })
  }

  return {
    toast,
    showToast,
    ToastComponent: toast ? <Toast {...toast} /> : null
  }
}
