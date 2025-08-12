"use client"

import { forwardRef, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const Toast = forwardRef(({ 
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className,
  ...props 
}, ref) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const types = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    }
  }

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = types[type]

  return (
    <Transition
      show={isVisible}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        ref={ref}
        className={cn(
          'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden',
          className
        )}
        {...props}
      >
        <div className={cn('p-4 border-l-4', bgColor, borderColor)}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-6 w-6', iconColor)} aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              {title && (
                <p className={cn('text-sm font-medium', textColor)}>
                  {title}
                </p>
              )}
              {message && (
                <p className={cn('mt-1 text-sm', textColor)}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={cn(
                  'bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                  iconColor.replace('text-', 'focus:ring-')
                )}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
})

Toast.displayName = 'Toast'

// Toast Container
const ToastContainer = forwardRef(({ 
  toasts = [], 
  position = 'bottom-center',
  className,
  ...props 
}, ref) => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col gap-2',
        positions[position],
        className
      )}
      {...props}
    >
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id || index}
          {...toast}
        />
      ))}
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'

export { Toast, ToastContainer } 