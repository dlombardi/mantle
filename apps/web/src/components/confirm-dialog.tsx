import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogPopup,
  DialogTitle,
} from './ui/dialog';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description/explanation */
  description?: string;
  /** Text user must type to confirm (case-insensitive) */
  confirmText: string;
  /** Label shown above the input */
  confirmLabel?: string;
  /** Button label (default: "Confirm") */
  buttonLabel?: string;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Whether the confirm action is loading */
  loading?: boolean;
  /** Use destructive styling (default: true) */
  destructive?: boolean;
  /** List of items that will be deleted (shown as bullet points) */
  deletionItems?: string[];
}

/**
 * Confirmation dialog with typing friction for destructive actions.
 *
 * User must type the confirmText exactly (case-insensitive) to enable the confirm button.
 * The input shows validation feedback: red border when wrong, green when correct.
 *
 * @example
 * <ConfirmDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   title="Disconnect api-server?"
 *   description="This action cannot be undone."
 *   confirmText="api-server"
 *   confirmLabel='Type "api-server" to confirm:'
 *   buttonLabel="Disconnect"
 *   onConfirm={handleDisconnect}
 *   deletionItems={[
 *     "8 authoritative patterns",
 *     "47 violation records",
 *   ]}
 * />
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLabel,
  buttonLabel = 'Confirm',
  onConfirm,
  loading = false,
  destructive = true,
  deletionItems,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');

  // Reset input when dialog closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
    }
  }, [open]);

  // Check if input matches (case-insensitive)
  const isMatch = inputValue.toLowerCase() === confirmText.toLowerCase();
  const hasInput = inputValue.length > 0;

  // Determine input border color
  const inputBorderClass = hasInput
    ? isMatch
      ? 'border-green-500 focus:ring-green-500'
      : 'border-red-500 focus:ring-red-500'
    : 'border-border focus:ring-ring';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Title */}
        <DialogTitle className="text-lg font-semibold pr-8">{title}</DialogTitle>

        {/* Warning alert */}
        <div className="mt-4 flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/30 p-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
          <p className="text-sm text-foreground">
            {description || 'This action cannot be undone.'}
          </p>
        </div>

        {/* Deletion items list */}
        {deletionItems && deletionItems.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              This will permanently delete:
            </p>
            <ul className="space-y-1">
              {deletionItems.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground flex items-center gap-2"
                >
                  <span className="text-muted-foreground">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Confirmation input */}
        <div className="mt-6">
          <label className="block text-sm text-muted-foreground mb-2">
            {confirmLabel || `Type "${confirmText}" to confirm:`}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            disabled={loading}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-md border bg-background',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              inputBorderClass
            )}
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={!isMatch || loading}
          >
            {loading ? 'Processing...' : buttonLabel}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
