import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cn } from '@/lib/utils';

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
} as const;

const sizeClasses = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-10 px-4 py-2 text-sm rounded-md',
  lg: 'h-11 px-8 text-base rounded-md',
  icon: 'h-10 w-10 rounded-md',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
