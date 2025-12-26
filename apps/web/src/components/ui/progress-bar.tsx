import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
} as const;

const variantClasses = {
  default: 'bg-accent-orange',
  success: 'bg-green-500',
} as const;

const trackVariantClasses = {
  default: 'bg-accent-orange/20',
  success: 'bg-green-500/20',
} as const;

export interface ProgressBarProps {
  /** Current progress value (0-100) */
  value: number;
  /** Size of the progress bar */
  size?: keyof typeof sizeClasses;
  /** Color variant */
  variant?: keyof typeof variantClasses;
  /** Enable pulse animation for indeterminate state */
  pulse?: boolean;
  /** Additional class names for the container */
  className?: string;
}

/**
 * ProgressBar component for visualizing progress.
 *
 * @example
 * // Basic usage
 * <ProgressBar value={35} />
 *
 * @example
 * // Success variant when complete
 * <ProgressBar value={100} variant="success" />
 *
 * @example
 * // Small size with pulse animation
 * <ProgressBar value={50} size="sm" pulse />
 */
export function ProgressBar({
  value,
  size = 'md',
  variant = 'default',
  pulse = false,
  className,
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'w-full overflow-hidden rounded-full',
        trackVariantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-out',
          variantClasses[variant],
          pulse && 'animate-pulse'
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
