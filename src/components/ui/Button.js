import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  as: Comp = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'btn'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg'
  }

  return (
    <Comp
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </Comp>
  )
})

Button.displayName = 'Button'

export default Button 