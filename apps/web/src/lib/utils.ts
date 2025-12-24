import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and merges Tailwind classes intelligently.
 * This prevents conflicting Tailwind classes from both being applied.
 *
 * @example
 * cn('px-4 py-2', 'px-8') // => 'py-2 px-8' (px-4 is removed)
 * cn('text-red-500', condition && 'text-blue-500') // => conditional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
