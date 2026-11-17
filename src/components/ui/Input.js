import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({
  className,
  type = 'text',
  icon,
  leftIcon,
  rightElement,
  ...props
}, ref) => {
  const IconComponent = leftIcon || icon;

  if (IconComponent || rightElement) {
    return (
      <div className="relative w-full">
        {IconComponent && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--muted-foreground)] pointer-events-none z-10">
            {typeof IconComponent === 'function' || (typeof IconComponent === 'object' && IconComponent.$$typeof)
              ? (typeof IconComponent === 'function' ? <IconComponent className="w-5 h-5" /> : IconComponent)
              : IconComponent}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'input w-full',
            IconComponent && '!pl-11',
            rightElement && '!pr-11',
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
            {rightElement}
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      className={cn('input', className)}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn('textarea', className)}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

const Select = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn('input', className)}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

export { Input, Textarea, Select };
