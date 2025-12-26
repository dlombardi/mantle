import type { Meta, StoryObj } from '@storybook/react-vite';
import { RepoCard, type Repo } from './repo-card';

const meta = {
  title: 'UI/RepoCard',
  component: RepoCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onReanalyze: { action: 'reanalyze' },
    onSettings: { action: 'settings' },
    onDisconnect: { action: 'disconnect' },
    onRetry: { action: 'retry' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RepoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseRepo = {
  id: '1',
  fullName: 'dlombardi/api-server',
  githubUrl: 'https://github.com/dlombardi/api-server',
};

/** Ready state - shows stats and last analyzed time */
export const Ready: Story = {
  args: {
    repo: {
      ...baseRepo,
      status: 'ready',
      stats: {
        authoritative: 8,
        candidates: 3,
        caught: 47,
        lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    } as Repo,
  },
};

/** Analyzing state - shows progress bar and current step */
export const Analyzing: Story = {
  args: {
    repo: {
      ...baseRepo,
      fullName: 'dlombardi/frontend',
      status: 'analyzing',
      progress: {
        percentage: 35,
        currentStep: 'Analyzing git history...',
      },
    } as Repo,
  },
};

/** Error state - shows error message with retry button */
export const Error: Story = {
  args: {
    repo: {
      ...baseRepo,
      fullName: 'dlombardi/shared-utils',
      status: 'error',
      error: {
        message: 'Analysis failed: Rate limit exceeded',
      },
    } as Repo,
  },
};

/** Pending state - queued for analysis */
export const Pending: Story = {
  args: {
    repo: {
      ...baseRepo,
      fullName: 'dlombardi/new-project',
      status: 'pending',
    } as Repo,
  },
};

/** All states side by side */
export const AllStates: Story = {
  args: {
    repo: baseRepo as Repo,
  },
  render: () => (
    <div className="space-y-4">
      <RepoCard
        repo={{
          id: '1',
          fullName: 'dlombardi/api-server',
          githubUrl: 'https://github.com/dlombardi/api-server',
          status: 'ready',
          stats: {
            authoritative: 8,
            candidates: 3,
            caught: 47,
            lastAnalyzed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        }}
        onReanalyze={() => console.log('Reanalyze clicked')}
        onSettings={() => console.log('Settings clicked')}
        onDisconnect={() => console.log('Disconnect clicked')}
      />
      <RepoCard
        repo={{
          id: '2',
          fullName: 'dlombardi/frontend',
          githubUrl: 'https://github.com/dlombardi/frontend',
          status: 'analyzing',
          progress: {
            percentage: 35,
            currentStep: 'Analyzing git history...',
          },
        }}
      />
      <RepoCard
        repo={{
          id: '3',
          fullName: 'dlombardi/shared-utils',
          githubUrl: 'https://github.com/dlombardi/shared-utils',
          status: 'error',
          error: {
            message: 'Analysis failed: Rate limit exceeded',
          },
        }}
        onRetry={() => console.log('Retry clicked')}
      />
      <RepoCard
        repo={{
          id: '4',
          fullName: 'dlombardi/new-project',
          githubUrl: 'https://github.com/dlombardi/new-project',
          status: 'pending',
        }}
      />
    </div>
  ),
};

/** Progress animation - multiple states of analyzing */
export const ProgressStages: Story = {
  args: {
    repo: baseRepo as Repo,
  },
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Analysis progress stages:</p>
      <RepoCard
        repo={{
          id: '1',
          fullName: 'dlombardi/repo-a',
          githubUrl: 'https://github.com/dlombardi/repo-a',
          status: 'analyzing',
          progress: { percentage: 10, currentStep: 'Indexing files...' },
        }}
      />
      <RepoCard
        repo={{
          id: '2',
          fullName: 'dlombardi/repo-b',
          githubUrl: 'https://github.com/dlombardi/repo-b',
          status: 'analyzing',
          progress: { percentage: 45, currentStep: 'Analyzing git history...' },
        }}
      />
      <RepoCard
        repo={{
          id: '3',
          fullName: 'dlombardi/repo-c',
          githubUrl: 'https://github.com/dlombardi/repo-c',
          status: 'analyzing',
          progress: { percentage: 78, currentStep: 'Extracting patterns...' },
        }}
      />
      <RepoCard
        repo={{
          id: '4',
          fullName: 'dlombardi/repo-d',
          githubUrl: 'https://github.com/dlombardi/repo-d',
          status: 'analyzing',
          progress: { percentage: 95, currentStep: 'Running backtest...' },
        }}
      />
    </div>
  ),
};
