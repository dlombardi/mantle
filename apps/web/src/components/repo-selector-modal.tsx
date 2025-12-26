import { useState, useMemo } from 'react';
import { Search, Check, Loader2, Lock, ExternalLink, X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogPopup,
  DialogClose,
  DialogTitle,
} from './ui/dialog';
import { cn } from '@/lib/utils';

/** Repository status in the selector */
export type RepoSelectorStatus = 'available' | 'connected' | 'analyzing';

/** Repository item in the selector */
export interface SelectorRepo {
  id: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  status: RepoSelectorStatus;
  /** Whether the repo exceeds the token limit (600k) */
  tooLarge?: boolean;
  /** Estimated token count (for display purposes) */
  estimatedTokens?: number;
}

export interface RepoSelectorModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Available repositories to show */
  repos: SelectorRepo[];
  /** Whether repos are loading */
  loading?: boolean;
  /** Called when user clicks "Connect & Analyze" */
  onConnect: (selectedRepoIds: number[]) => void;
  /** Whether the connect action is in progress */
  connecting?: boolean;
  /** URL to update GitHub permissions */
  permissionsUrl?: string;
}

/**
 * Modal for selecting repositories to connect when GitHub App is already installed.
 *
 * @example
 * <RepoSelectorModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   repos={repos}
 *   onConnect={(ids) => connectMutation.mutate(ids)}
 * />
 */
export function RepoSelectorModal({
  open,
  onOpenChange,
  repos,
  loading = false,
  onConnect,
  connecting = false,
  permissionsUrl,
}: RepoSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Filter repos by search query
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter((repo) =>
      repo.fullName.toLowerCase().includes(query)
    );
  }, [repos, searchQuery]);

  // Separate available and connected repos
  const availableRepos = filteredRepos.filter((r) => r.status === 'available');
  const connectedRepos = filteredRepos.filter((r) => r.status !== 'available');

  // Toggle selection
  const toggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all available repos (excluding oversized ones)
  const selectAll = () => {
    const selectableRepos = availableRepos.filter((r) => !r.tooLarge);
    setSelectedIds(new Set(selectableRepos.map((r) => r.id)));
  };

  // Handle connect
  const handleConnect = () => {
    onConnect(Array.from(selectedIds));
  };

  // Reset on close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSearchQuery('');
      setSelectedIds(new Set());
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup className="max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <DialogTitle>Add Repositories</DialogTitle>
          <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Available repos */}
              {availableRepos.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Available
                    </span>
                    <button
                      onClick={selectAll}
                      className="text-xs text-accent-orange hover:text-accent-orange/80 transition-colors"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {availableRepos.map((repo) => (
                      <RepoItem
                        key={repo.id}
                        repo={repo}
                        selected={selectedIds.has(repo.id)}
                        onSelect={() => toggleSelection(repo.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Connected repos */}
              {connectedRepos.length > 0 && (
                <div className="mb-6">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                    Already Connected
                  </span>
                  <div className="space-y-2">
                    {connectedRepos.map((repo) => (
                      <RepoItem key={repo.id} repo={repo} connected />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredRepos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No matching repositories'
                    : 'No repositories found'}
                </div>
              )}

              {/* Permissions link */}
              {permissionsUrl && (
                <div className="border-t border-border pt-4 mt-4">
                  <a
                    href={permissionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent-orange hover:text-accent-orange/80 transition-colors inline-flex items-center gap-1"
                  >
                    Don't see a repo? Update GitHub Permissions
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border mt-4">
          {selectedIds.size > 0 && (
            <div className="bg-muted rounded-md px-3 py-2 mb-4 text-sm text-muted-foreground">
              {selectedIds.size} repository{selectedIds.size !== 1 ? 'ies' : ''}{' '}
              selected
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <DialogClose className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Cancel
            </DialogClose>
            <Button
              onClick={handleConnect}
              disabled={selectedIds.size === 0 || connecting}
            >
              {connecting ? 'Connecting...' : 'Connect & Analyze'}
            </Button>
          </div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

/** Individual repo item in the list */
function RepoItem({
  repo,
  selected,
  connected,
  onSelect,
}: {
  repo: SelectorRepo;
  selected?: boolean;
  connected?: boolean;
  onSelect?: () => void;
}) {
  const isAnalyzing = repo.status === 'analyzing';
  const isDisabled = connected || repo.tooLarge;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-md border transition-all text-left',
        isDisabled
          ? 'bg-muted/50 border-border cursor-default opacity-70'
          : selected
            ? 'border-accent-orange bg-accent-orange/10'
            : 'border-border hover:bg-muted/50'
      )}
    >
      {/* Checkbox/status indicator */}
      <div
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
          connected
            ? 'bg-accent-orange border-accent-orange'
            : repo.tooLarge
              ? 'border-muted-foreground bg-muted'
              : selected
                ? 'bg-accent-orange border-accent-orange'
                : 'border-muted-foreground'
        )}
      >
        {connected && (
          <Check className="h-3 w-3 text-accent-orange-foreground" />
        )}
        {!connected && selected && !repo.tooLarge && (
          <Check className="h-3 w-3 text-accent-orange-foreground" />
        )}
      </div>

      {/* Repo info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{repo.fullName}</div>
        <div className="text-xs text-muted-foreground">{repo.defaultBranch}</div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {repo.tooLarge && (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Too large
          </span>
        )}
        {repo.private && !repo.tooLarge && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Private
          </span>
        )}
        {connected && !repo.tooLarge && (
          <span
            className={cn(
              'text-xs',
              isAnalyzing ? 'text-accent-orange' : 'text-green-600 dark:text-green-400'
            )}
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing
              </span>
            ) : (
              'Ready'
            )}
          </span>
        )}
      </div>
    </button>
  );
}
