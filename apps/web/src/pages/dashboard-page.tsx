import { useState } from 'react';
import { Plus, FolderGit2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { RepoCard, type Repo } from '@/components/ui/repo-card';
import { GitHubConnectModal } from '@/components/github-connect-modal';
import { RepoSelectorModal, type SelectorRepo } from '@/components/repo-selector-modal';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const GITHUB_APP_NAME = 'mantle-dev';

export function DashboardPage() {
  const { user } = useAuth();
  const username = user?.user_metadata?.user_name || 'there';

  // Modal states
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  // Fetch user's repos
  const {
    data: reposData,
    isLoading: reposLoading,
    refetch: refetchRepos,
  } = trpc.repos.list.useQuery({ page: 1, limit: 20 });

  // Check if user has GitHub App installed
  const { data: installation } = trpc.github.getInstallation.useQuery();

  // Get installation URL for redirecting to GitHub
  const { data: installationUrl } = trpc.github.getInstallationUrl.useQuery();

  // Fetch repos from GitHub installation (only when selector is open)
  const {
    data: installationRepos,
    isLoading: installationReposLoading,
  } = trpc.github.listInstallationRepos.useQuery(
    { installationId: installation?.installationId ?? 0 },
    { enabled: showRepoSelector && !!installation?.hasInstallation && !!installation.installationId }
  );

  // Connect repos mutation
  const connectMutation = trpc.github.connectRepos.useMutation({
    onSuccess: (data) => {
      setShowRepoSelector(false);
      toast.success(`Connected ${data.connected} repositor${data.connected !== 1 ? 'ies' : 'y'}`, {
        description: 'Starting analysis...',
      });
      refetchRepos();
    },
    onError: (error) => {
      toast.error('Failed to connect repositories', {
        description: error.message,
      });
    },
  });

  // Trigger re-analysis mutation
  const triggerIngestionMutation = trpc.repos.triggerIngestion.useMutation({
    onSuccess: () => {
      toast.info('Re-analysis started');
      refetchRepos();
    },
    onError: (error) => {
      toast.error('Failed to trigger analysis', {
        description: error.message,
      });
    },
  });

  // Handle "+ Add Repo" click
  const handleAddRepo = () => {
    if (installation?.hasInstallation) {
      // User has GitHub App installed - show repo selector
      setShowRepoSelector(true);
    } else {
      // No installation - show pre-flight modal
      setShowConnectModal(true);
    }
  };

  // Handle GitHub redirect
  const handleContinueToGitHub = () => {
    const url = installationUrl?.url ?? `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;
    window.location.href = url;
  };

  // Handle repo connection from selector
  const handleConnectRepos = (selectedIds: number[]) => {
    if (installation?.installationId) {
      connectMutation.mutate({
        installationId: installation.installationId,
        repoIds: selectedIds,
      });
    }
  };

  // Map installation repos to SelectorRepo format
  const selectorRepos: SelectorRepo[] = (installationRepos ?? []).map((repo) => ({
    id: repo.id,
    fullName: repo.fullName,
    defaultBranch: repo.defaultBranch,
    private: repo.private,
    status: repo.isConnected ? 'connected' : 'available',
  }));

  // Map repo data to RepoCard Repo type
  const repos: Repo[] = (reposData?.items ?? []).map((item) => {
    // Build the proper Repo type based on status
    const baseRepo = {
      id: item.id,
      fullName: item.fullName,
      githubUrl: item.githubUrl,
    };

    switch (item.status) {
      case 'ready':
        return {
          ...baseRepo,
          status: 'ready' as const,
          stats: item.stats!,
        };
      case 'analyzing':
        return {
          ...baseRepo,
          status: 'analyzing' as const,
          progress: item.progress!,
        };
      case 'error':
        return {
          ...baseRepo,
          status: 'error' as const,
          error: item.error!,
        };
      case 'pending':
      default:
        return {
          ...baseRepo,
          status: 'pending' as const,
        };
    }
  });

  const hasRepos = repos.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {username}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your repositories and patterns.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Repositories"
          value={String(repos.length)}
          description="Connected repos"
        />
        <StatCard
          title="Patterns"
          value={String(repos.reduce((sum, r) => sum + (r.status === 'ready' ? r.stats.candidates : 0), 0))}
          description="Extracted patterns"
        />
        <StatCard
          title="Pending Review"
          value={String(repos.filter(r => r.status === 'analyzing' || r.status === 'pending').length)}
          description="Awaiting analysis"
        />
        <StatCard
          title="Active"
          value={String(repos.reduce((sum, r) => sum + (r.status === 'ready' ? r.stats.authoritative : 0), 0))}
          description="Enforced patterns"
        />
      </div>

      {/* Repositories section */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Your Repositories</h2>
          <Button onClick={handleAddRepo} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Repo
          </Button>
        </div>

        <div className="p-6">
          {reposLoading ? (
            <LoadingState />
          ) : hasRepos ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {repos.map((repo) => (
                <RepoCard
                  key={repo.id}
                  repo={repo}
                  onReanalyze={() => triggerIngestionMutation.mutate({ id: repo.id })}
                  onSettings={() => {
                    // TODO: Navigate to repo settings
                    toast.info('Repo settings coming soon');
                  }}
                  onDisconnect={() => {
                    // TODO: Show disconnect confirmation dialog
                    toast.info('Disconnect feature coming soon');
                  }}
                  onRetry={() => triggerIngestionMutation.mutate({ id: repo.id })}
                />
              ))}
            </div>
          ) : (
            <EmptyState onConnect={handleAddRepo} />
          )}
        </div>
      </div>

      {/* Pre-flight modal for GitHub connection */}
      <GitHubConnectModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onContinue={handleContinueToGitHub}
      />

      {/* Repo selector modal for adding more repos */}
      <RepoSelectorModal
        open={showRepoSelector}
        onOpenChange={setShowRepoSelector}
        repos={selectorRepos}
        loading={installationReposLoading}
        onConnect={handleConnectRepos}
        connecting={connectMutation.isPending}
        permissionsUrl={`https://github.com/apps/${GITHUB_APP_NAME}/installations/new`}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
}

function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-md border border-border bg-card p-4 animate-pulse"
        >
          <div className="h-5 bg-muted rounded w-3/4 mb-3" />
          <div className="h-4 bg-muted rounded w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <FolderGit2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Connect a repository to start discovering patterns in your codebase.
      </p>
      <Button onClick={onConnect}>
        <Plus className="h-4 w-4 mr-2" />
        Connect Repository
      </Button>
    </div>
  );
}
