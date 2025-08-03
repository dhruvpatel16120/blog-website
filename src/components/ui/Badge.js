import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Badge = forwardRef(({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: 'badge-default',
    secondary: 'badge-secondary',
    outline: 'badge-outline'
  }

  return (
    <span
      ref={ref}
      className={cn(
        'badge',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = 'Badge'

export default Badge 