import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';

export function DashboardPage() {
  const { user } = useAuth();
  const username = user?.user_metadata?.user_name || 'there';

  return (
    <div className="space-y-6">
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
        <StatCard title="Repositories" value="0" description="Connected repos" />
        <StatCard title="Patterns" value="0" description="Extracted patterns" />
        <StatCard title="Pending Review" value="0" description="Awaiting validation" />
        <StatCard title="Active" value="0" description="Enforced patterns" />
      </div>

      {/* Get started card */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Get Started</h2>
        <p className="text-muted-foreground mb-4">
          Connect a repository to begin extracting patterns from your codebase.
        </p>
        <ConnectRepoButton />
      </div>
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

/**
 * Button to initiate GitHub App installation.
 * Uses tRPC to get the installation URL for the configured app.
 */
function ConnectRepoButton() {
  const { data, isLoading, error } = trpc.github.getInstallationUrl.useQuery();

  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg opacity-50 cursor-not-allowed"
      >
        <GitHubIcon className="w-5 h-5 mr-2" />
        Loading...
      </button>
    );
  }

  if (error || !data?.url) {
    // Fallback to hardcoded URL if tRPC fails
    const fallbackUrl = 'https://github.com/apps/mantle-dev/installations/new';
    return (
      <a
        href={fallbackUrl}
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <GitHubIcon className="w-5 h-5 mr-2" />
        Connect Repository
      </a>
    );
  }

  return (
    <a
      href={data.url}
      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <GitHubIcon className="w-5 h-5 mr-2" />
      Connect Repository
    </a>
  );
}

/**
 * GitHub logo icon component.
 */
function GitHubIcon({ className }: { className?: string }) {
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
