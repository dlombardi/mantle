import * as React from 'react';
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { cn } from '@/lib/utils';

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <BaseCheckbox.Root
        ref={ref}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[checked]:bg-primary data-[checked]:text-primary-foreground',
          className
        )}
        {...props}
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-current">
          <CheckIcon />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
    </div>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
