import { MoreVertical, RefreshCw, Settings, ExternalLink, Unlink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './progress-bar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './dropdown-menu';

/** Repository status variants */
export type RepoStatus = 'ready' | 'analyzing' | 'error' | 'pending';

/** Stats for a repo in Ready state */
export interface RepoStats {
  authoritative: number;
  candidates: number;
  caught: number;
  lastAnalyzed: Date | string;
}

/** Progress info for Analyzing state */
export interface RepoProgress {
  percentage: number;
  currentStep: string;
}

/** Error info for Error state */
export interface RepoError {
  message: string;
}

/** Base repo info common to all states */
interface RepoBase {
  id: string;
  fullName: string;
  githubUrl: string;
}

/** Ready state repo */
interface RepoReady extends RepoBase {
  status: 'ready';
  stats: RepoStats;
}

/** Analyzing state repo */
interface RepoAnalyzing extends RepoBase {
  status: 'analyzing';
  progress: RepoProgress;
}

/** Error state repo */
interface RepoErrorState extends RepoBase {
  status: 'error';
  error: RepoError;
}

/** Pending state repo */
interface RepoPending extends RepoBase {
  status: 'pending';
}

/** Union type for all repo states */
export type Repo = RepoReady | RepoAnalyzing | RepoErrorState | RepoPending;

export interface RepoCardProps {
  repo: Repo;
  /** Called when user clicks "Re-analyze Repo" */
  onReanalyze?: () => void;
  /** Called when user clicks "Repo Settings" */
  onSettings?: () => void;
  /** Called when user clicks "Disconnect Repo" */
  onDisconnect?: () => void;
  /** Called when user clicks "Retry" in error state */
  onRetry?: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * RepoCard displays a repository with its current status.
 *
 * @example
 * // Ready state
 * <RepoCard
 *   repo={{
 *     id: '1',
 *     fullName: 'dlombardi/api-server',
 *     githubUrl: 'https://github.com/dlombardi/api-server',
 *     status: 'ready',
 *     stats: { authoritative: 8, candidates: 3, caught: 47, lastAnalyzed: new Date() }
 *   }}
 * />
 *
 * @example
 * // Analyzing state
 * <RepoCard
 *   repo={{
 *     id: '2',
 *     fullName: 'dlombardi/frontend',
 *     githubUrl: 'https://github.com/dlombardi/frontend',
 *     status: 'analyzing',
 *     progress: { percentage: 35, currentStep: 'Analyzing git history...' }
 *   }}
 * />
 */
export function RepoCard({
  repo,
  onReanalyze,
  onSettings,
  onDisconnect,
  onRetry,
  className,
}: RepoCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card p-4 transition-colors',
        className
      )}
    >
      {/* Header: repo name + status indicator + overflow menu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground truncate">
            {repo.fullName}
          </span>
          <StatusIndicator status={repo.status} />
        </div>
        <OverflowMenu
          repo={repo}
          onReanalyze={onReanalyze}
          onSettings={onSettings}
          onDisconnect={onDisconnect}
        />
      </div>

      {/* Body: state-specific content */}
      <RepoCardBody repo={repo} onRetry={onRetry} />
    </div>
  );
}

/** Status indicator badge/icon */
function StatusIndicator({ status }: { status: RepoStatus }) {
  switch (status) {
    case 'analyzing':
      return (
        <span className="flex items-center gap-1 text-xs text-accent-orange">
          <Loader2 className="h-3 w-3 animate-spin" />
          Analyzing
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          Error
        </span>
      );
    case 'pending':
      return (
        <span className="text-xs text-muted-foreground">Pending</span>
      );
    default:
      return null;
  }
}

/** State-specific body content */
function RepoCardBody({
  repo,
  onRetry,
}: {
  repo: Repo;
  onRetry?: () => void;
}) {
  switch (repo.status) {
    case 'ready':
      return <ReadyBody stats={repo.stats} />;
    case 'analyzing':
      return <AnalyzingBody progress={repo.progress} />;
    case 'error':
      return <ErrorBody error={repo.error} onRetry={onRetry} />;
    case 'pending':
      return <PendingBody />;
  }
}

/** Ready state: stats + last analyzed */
function ReadyBody({ stats }: { stats: RepoStats }) {
  const lastAnalyzedDate =
    typeof stats.lastAnalyzed === 'string'
      ? new Date(stats.lastAnalyzed)
      : stats.lastAnalyzed;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {stats.authoritative} authoritative · {stats.candidates} candidates ·{' '}
        {stats.caught} caught
      </p>
      <p className="text-xs text-muted-foreground">
        Last analyzed: {formatRelativeTime(lastAnalyzedDate)}
      </p>
    </div>
  );
}

/** Analyzing state: progress bar + current step */
function AnalyzingBody({ progress }: { progress: RepoProgress }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ProgressBar value={progress.percentage} size="sm" className="flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {progress.percentage}%
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{progress.currentStep}</p>
    </div>
  );
}

/** Error state: message + retry button */
function ErrorBody({
  error,
  onRetry,
}: {
  error: RepoError;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-destructive">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-accent-orange hover:text-accent-orange/80 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/** Pending state: queued message */
function PendingBody() {
  return (
    <p className="text-sm text-muted-foreground">Queued for analysis</p>
  );
}

/** Overflow menu with repo actions */
function OverflowMenu({
  repo,
  onReanalyze,
  onSettings,
  onDisconnect,
}: {
  repo: Repo;
  onReanalyze?: () => void;
  onSettings?: () => void;
  onDisconnect?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="p-1 rounded-md hover:bg-muted transition-colors"
        aria-label="Repository options"
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        <DropdownMenuItem onClick={onReanalyze}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-analyze Repo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings}>
          <Settings className="h-4 w-4 mr-2" />
          Repo Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(repo.githubUrl, '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on GitHub
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDisconnect}
          className="text-destructive hover:text-destructive focus:text-destructive"
        >
          <Unlink className="h-4 w-4 mr-2" />
          Disconnect Repo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Format a date as relative time (e.g., "2 days ago") */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  return 'Just now';
}
