import * as React from 'react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof sizeClasses;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const showFallback = !src || imageError;

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span className="font-medium text-muted-foreground">
          {fallback?.charAt(0).toUpperCase() || '?'}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </span>
  );
}
