import { Toaster as SonnerToaster, toast } from 'sonner';

/**
 * Toast notification system.
 *
 * Place <Toaster /> once in your app root to enable toast notifications.
 * Then use toast() anywhere to show notifications.
 *
 * @example
 * // In root layout
 * <Toaster />
 *
 * @example
 * // Show toasts anywhere
 * toast.success('Connected 2 repositories')
 * toast.error('Failed to connect')
 * toast.info('Analyzing in background...')
 * toast('Neutral message')
 *
 * @example
 * // Persistent toast (no auto-dismiss)
 * toast.success('Analysis complete!', { duration: Infinity })
 *
 * @example
 * // Toast with action
 * toast.success('Analysis complete!', {
 *   action: {
 *     label: 'View Patterns',
 *     onClick: () => navigate('/patterns'),
 *   },
 * })
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'group flex items-center gap-3 w-full p-4 rounded-md shadow-lg border',
          default: 'bg-card text-card-foreground border-border',
          success:
            'bg-accent-orange/10 text-foreground border-accent-orange/30',
          error: 'bg-destructive/10 text-foreground border-destructive/30',
          info: 'bg-muted text-muted-foreground border-border',
          warning: 'bg-yellow-500/10 text-foreground border-yellow-500/30',
          title: 'font-medium text-sm',
          description: 'text-sm text-muted-foreground',
          actionButton:
            'text-sm font-medium text-accent-orange hover:text-accent-orange/80 transition-colors',
          cancelButton:
            'text-sm font-medium text-muted-foreground hover:text-foreground transition-colors',
          closeButton:
            'text-muted-foreground hover:text-foreground transition-colors',
        },
      }}
      closeButton
      richColors={false}
      gap={8}
    />
  );
}

// Re-export toast function for convenience
export { toast };
