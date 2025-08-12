"use client"

import { forwardRef, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const Dropdown = forwardRef(({ 
  trigger, 
  items = [], 
  align = 'left',
  className,
  triggerClassName,
  menuClassName,
  variant = 'default', // 'default' | 'unstyled'
  ...props 
}, ref) => {
  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2'
  }

  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)} ref={ref} {...props}>
      <div>
        <Menu.Button
          className={cn(
            variant === 'unstyled'
              ? 'inline-flex items-center gap-2 focus:outline-none'
              : 'inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors',
            triggerClassName
          )}
          style={
            variant === 'unstyled'
              ? undefined
              : {
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  '&:hover': { backgroundColor: 'var(--muted)' },
                }
          }
        >
          <div className="flex items-center gap-2">
            {trigger}
            <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={cn(
          'absolute z-10 w-56 mt-2 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          alignments[align],
          menuClassName
        )} style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          border: '1px solid var(--border)'
        }}>
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'group flex items-center w-full px-4 py-2 text-sm transition-colors',
                      active ? 'bg-muted' : 'text-foreground'
                    )}
                    style={{
                      color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      '&:hover': {
                        backgroundColor: 'var(--muted)',
                        color: 'var(--foreground)'
                      }
                    }}
                    disabled={item.disabled}
                  >
                    {item.icon && (
                      <span className="mr-3 h-5 w-5" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
})

Dropdown.displayName = 'Dropdown'

export default Dropdown 