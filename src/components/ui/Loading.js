import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Spinner Component
const Spinner = forwardRef(({ size = 'md', className, ...props }, ref) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
        sizes[size],
        className
      )}
      {...props}
    />
  )
})

Spinner.displayName = 'Spinner'

// Skeleton Component
const Skeleton = forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('animate-pulse bg-gray-200 rounded', className)}
      {...props}
    />
  )
})

Skeleton.displayName = 'Skeleton'

// Loading Overlay
const LoadingOverlay = forwardRef(({ 
  isLoading, 
  children, 
  className,
  spinnerSize = 'lg',
  ...props 
}, ref) => {
  if (!isLoading) return children

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <div className="text-center">
          <Spinner size={spinnerSize} className="mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
})

LoadingOverlay.displayName = 'LoadingOverlay'

// Card Skeleton
const CardSkeleton = forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('card p-6', className)} {...props}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  )
})

CardSkeleton.displayName = 'CardSkeleton'

// Text Skeleton
const TextSkeleton = forwardRef(({ lines = 3, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
})

TextSkeleton.displayName = 'TextSkeleton'

// Button Skeleton
const ButtonSkeleton = forwardRef(({ className, ...props }, ref) => {
  return (
    <Skeleton
      ref={ref}
      className={cn('h-10 w-24 rounded-md', className)}
      {...props}
    />
  )
})

ButtonSkeleton.displayName = 'ButtonSkeleton'

export { 
  Spinner, 
  Skeleton, 
  LoadingOverlay, 
  CardSkeleton, 
  TextSkeleton, 
  ButtonSkeleton 
} 