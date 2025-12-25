/**
 * GitHub App installation callback route.
 *
 * After a user installs the GitHub App, GitHub redirects here with:
 * - installation_id: The ID of the new installation
 * - setup_action: 'install' or 'update'
 *
 * This page verifies the installation, lists accessible repos,
 * and allows the user to select which repos to connect.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

const searchSchema = z.object({
  installation_id: z.coerce.number().optional(),
  setup_action: z.enum(['install', 'update']).optional(),
});

export const Route = createFileRoute('/github/setup')({
  validateSearch: searchSchema,
  component: GitHubSetupPage,
});

function GitHubSetupPage() {
  const { installation_id } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);

  // Verify the installation belongs to this user
  const {
    data: verification,
    isLoading: verifying,
    error: verifyError,
  } = trpc.github.verifyInstallation.useQuery(
    { installationId: installation_id! },
    {
      enabled: !!installation_id && !!user && !authLoading,
      retry: false,
    }
  );

  // List repos accessible to this installation
  const { data: repos, isLoading: loadingRepos } =
    trpc.github.listInstallationRepos.useQuery(
      { installationId: installation_id! },
      {
        enabled: !!verification?.valid,
      }
    );

  // Mutation to connect selected repos
  const connectMutation = trpc.github.connectRepos.useMutation({
    onSuccess: (data) => {
      navigate({
        to: '/dashboard',
        search: { connected: data.connected },
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({
        to: '/',
        search: { redirect: `/github/setup?installation_id=${installation_id}` },
      });
    }
  }, [authLoading, user, navigate, installation_id]);

  // Handle missing installation_id
  if (!installation_id) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Missing Installation ID
          </h1>
          <p className="text-muted-foreground mb-6">
            This page should be accessed after installing the GitHub App.
            Please start from the dashboard.
          </p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Dashboard
          </a>
        </div>
      </main>
    );
  }

  // Loading state
  if (authLoading || verifying) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying installation...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (verifyError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Installation Error
          </h1>
          <p className="text-muted-foreground mb-6">{verifyError.message}</p>
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Dashboard
          </a>
        </div>
      </main>
    );
  }

  const handleConnect = () => {
    if (selectedRepos.length > 0 && installation_id) {
      connectMutation.mutate({
        installationId: installation_id,
        repoIds: selectedRepos,
      });
    }
  };

  const toggleRepo = (repoId: number) => {
    setSelectedRepos((prev) =>
      prev.includes(repoId)
        ? prev.filter((id) => id !== repoId)
        : [...prev, repoId]
    );
  };

  const selectAll = () => {
    const availableRepos = repos?.filter((r) => !r.isConnected) ?? [];
    setSelectedRepos(availableRepos.map((r) => r.id));
  };

  const clearSelection = () => {
    setSelectedRepos([]);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Connect Repositories</h1>
        <p className="text-muted-foreground mb-6">
          Select repositories from{' '}
          <span className="font-medium">{verification?.account.login}</span> to
          analyze.
          {verification?.account.type === 'Organization' && (
            <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded">
              Organization
            </span>
          )}
        </p>

        {loadingRepos ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading repositories...
            </p>
          </div>
        ) : repos && repos.length > 0 ? (
          <>
            {/* Selection controls */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedRepos.length} of{' '}
                {repos.filter((r) => !r.isConnected).length} available selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select all
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Repo list */}
            <div className="space-y-2 mb-6">
              {repos.map((repo) => (
                <label
                  key={repo.id}
                  className={`
                    flex items-center p-4 border rounded-lg cursor-pointer transition-colors
                    ${repo.isConnected ? 'bg-muted opacity-60 cursor-not-allowed' : 'hover:bg-muted/50'}
                    ${selectedRepos.includes(repo.id) && !repo.isConnected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedRepos.includes(repo.id) || repo.isConnected}
                    disabled={repo.isConnected}
                    onChange={() => toggleRepo(repo.id)}
                    className="mr-3 h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">
                      {repo.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {repo.defaultBranch}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {repo.private && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        Private
                      </span>
                    )}
                    {repo.isConnected && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Connected
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-muted-foreground">
              No repositories found for this installation.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleConnect}
            disabled={
              selectedRepos.length === 0 || connectMutation.isPending
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connectMutation.isPending
              ? 'Connecting...'
              : `Connect ${selectedRepos.length} repo${selectedRepos.length !== 1 ? 's' : ''}`}
          </button>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
        </div>

        {/* Error display */}
        {connectMutation.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              {connectMutation.error.message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
