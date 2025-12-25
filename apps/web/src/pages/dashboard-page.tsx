import { useAuth } from '@/hooks/use-auth';

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
        <p className="text-muted-foreground">
          Connect a repository to begin extracting patterns from your codebase.
        </p>
        {/* ConnectRepoButton will go here in mantle-h7s */}
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
