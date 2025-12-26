import { ArrowRight, Lock, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogPopup,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

export interface GitHubConnectModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Called when user clicks "Continue to GitHub" */
  onContinue: () => void;
  /** Whether the continue action is loading */
  loading?: boolean;
}

/**
 * Pre-flight modal shown before redirecting to GitHub for app installation.
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <GitHubConnectModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   onContinue={() => {
 *     window.location.href = installationUrl;
 *   }}
 * />
 */
export function GitHubConnectModal({
  open,
  onOpenChange,
  onContinue,
  loading = false,
}: GitHubConnectModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        {/* Close button */}
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* GitHub logo */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <GitHubLogo className="h-10 w-10" />
          </div>
        </div>

        {/* Title */}
        <DialogTitle className="text-center text-xl font-semibold">
          Connect to GitHub
        </DialogTitle>

        {/* Description */}
        <DialogDescription className="text-center">
          You'll be redirected to GitHub to:
        </DialogDescription>

        {/* Steps list */}
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              1
            </span>
            <span>Install the Mantle app on your account</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              2
            </span>
            <span>Select which repositories to grant access</span>
          </li>
        </ol>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 rounded-md bg-muted/50 p-3">
          <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            We only read code to discover patterns.{' '}
            <span className="font-medium text-foreground">
              Your source code is never stored.
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={onContinue}
            disabled={loading}
            className="w-full justify-center"
          >
            {loading ? (
              'Redirecting...'
            ) : (
              <>
                Continue to GitHub
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          <DialogClose className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors">
            or cancel
          </DialogClose>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

/** GitHub logo SVG */
function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
