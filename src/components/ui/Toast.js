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
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-400 dark:text-green-300'
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-400 dark:text-red-300'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-400 dark:text-yellow-300'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-400 dark:text-blue-300'
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
          'min-w-[280px] sm:min-w-[320px] max-w-sm sm:max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 dark:ring-white ring-opacity-10 overflow-hidden border border-gray-200 dark:border-gray-700',
          className
        )}
        {...props}
      >
        <div className={cn('p-3 sm:p-4 border-l-4', bgColor, borderColor)}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={cn('h-5 w-5', iconColor)} aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              {title && (
                <p className={cn('text-sm font-medium break-words', textColor)}>
                  {title}
                </p>
              )}
              {message && (
                <p className={cn('mt-1 text-sm leading-relaxed break-words max-w-xs sm:max-w-sm', textColor)}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-3 flex flex-shrink-0">
              <button
                type="button"
                className={cn(
                  'rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 p-1',
                  iconColor.replace('text-', 'focus:ring-')
                )}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
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
        'fixed z-[9999] flex flex-col gap-3 px-4 sm:px-0',
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