import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RepoSelectorModal, type SelectorRepo, type ReposByInstallation } from './repo-selector-modal';
import { Button } from './ui/button';

const sampleRepos: SelectorRepo[] = [
  { id: 1, fullName: 'dlombardi/new-project', defaultBranch: 'main', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
  { id: 2, fullName: 'dlombardi/side-project', defaultBranch: 'main', private: true, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
  { id: 3, fullName: 'dlombardi/experiment', defaultBranch: 'master', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
  { id: 4, fullName: 'dlombardi/api-server', defaultBranch: 'main', private: false, status: 'connected', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
  { id: 5, fullName: 'dlombardi/frontend', defaultBranch: 'main', private: false, status: 'analyzing', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
];

const meta = {
  title: 'Components/RepoSelectorModal',
  component: RepoSelectorModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    repos: sampleRepos,
    onOpenChange: () => {},
    onConnect: () => {},
  },
  argTypes: {
    onConnect: { action: 'connect' },
    onOpenChange: { action: 'openChange' },
  },
} satisfies Meta<typeof RepoSelectorModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default modal with available and connected repos */
export const Default: Story = {
  args: {
    permissionsUrl: 'https://github.com/settings/installations',
  },
};

/** Loading state while fetching repos */
export const Loading: Story = {
  args: {
    repos: [],
    loading: true,
  },
};

/** Empty state - no repos found */
export const Empty: Story = {
  args: {
    repos: [],
    loading: false,
    permissionsUrl: 'https://github.com/settings/installations',
  },
};

/** Connecting state after clicking Connect */
export const Connecting: Story = {
  args: {
    connecting: true,
  },
};

/** All repos already connected */
export const AllConnected: Story = {
  args: {
    repos: sampleRepos.map((r) => ({
      ...r,
      status: r.id % 2 === 0 ? 'connected' : 'analyzing',
    })) as SelectorRepo[],
    permissionsUrl: 'https://github.com/settings/installations',
  },
};

/** Interactive demo with full workflow */
export const Interactive: Story = {
  args: {
    open: false,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const handleConnect = (reposByInstallation: ReposByInstallation[]) => {
      setConnecting(true);
      const allRepoIds = reposByInstallation.flatMap((group) => group.repoIds);
      setTimeout(() => {
        setConnecting(false);
        setOpen(false);
        alert(`Connected repos: ${allRepoIds.join(', ')}`);
      }, 1500);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          + Add Repo
        </Button>
        <RepoSelectorModal
          open={open}
          onOpenChange={setOpen}
          repos={sampleRepos}
          onConnect={handleConnect}
          connecting={connecting}
          permissionsUrl="https://github.com/settings/installations"
        />
      </>
    );
  },
};

/** Many repos to demonstrate scrolling */
export const ManyRepos: Story = {
  args: {
    repos: [
      ...Array.from({ length: 15 }, (_, i) => ({
        id: i + 100,
        fullName: `dlombardi/project-${i + 1}`,
        defaultBranch: 'main',
        private: i % 3 === 0,
        status: 'available' as const,
        installationId: 123,
        installationAccount: 'dlombardi',
        installationType: 'User' as const,
      })),
      ...sampleRepos.filter((r) => r.status !== 'available'),
    ],
    permissionsUrl: 'https://github.com/settings/installations',
  },
};

/** Multi-installation demo showing repos grouped by account */
export const MultiInstallation: Story = {
  args: {
    repos: [
      // Personal repos
      { id: 1, fullName: 'dlombardi/personal-project', defaultBranch: 'main', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User', installationAvatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4' },
      { id: 2, fullName: 'dlombardi/my-app', defaultBranch: 'main', private: true, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User', installationAvatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4' },
      // Org repos
      { id: 3, fullName: 'acme-corp/shared-lib', defaultBranch: 'main', private: true, status: 'available', installationId: 456, installationAccount: 'acme-corp', installationType: 'Organization', installationAvatarUrl: 'https://avatars.githubusercontent.com/u/67890?v=4' },
      { id: 4, fullName: 'acme-corp/api-gateway', defaultBranch: 'main', private: true, status: 'available', installationId: 456, installationAccount: 'acme-corp', installationType: 'Organization', installationAvatarUrl: 'https://avatars.githubusercontent.com/u/67890?v=4' },
      { id: 5, fullName: 'acme-corp/frontend', defaultBranch: 'main', private: true, status: 'connected', installationId: 456, installationAccount: 'acme-corp', installationType: 'Organization', installationAvatarUrl: 'https://avatars.githubusercontent.com/u/67890?v=4' },
    ],
    permissionsUrl: 'https://github.com/settings/installations',
  },
};

/** Search functionality demo with multiple installations */
export const WithSearch: Story = {
  args: {
    open: false,
  },
  render: () => {
    const manyRepos: SelectorRepo[] = [
      { id: 1, fullName: 'dlombardi/react-app', defaultBranch: 'main', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
      { id: 2, fullName: 'dlombardi/vue-project', defaultBranch: 'main', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
      { id: 3, fullName: 'dlombardi/angular-demo', defaultBranch: 'main', private: false, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
      { id: 4, fullName: 'dlombardi/svelte-kit', defaultBranch: 'main', private: true, status: 'available', installationId: 123, installationAccount: 'dlombardi', installationType: 'User' },
      { id: 5, fullName: 'company/shared-components', defaultBranch: 'main', private: true, status: 'connected', installationId: 456, installationAccount: 'company', installationType: 'Organization' },
      { id: 6, fullName: 'company/design-system', defaultBranch: 'main', private: true, status: 'analyzing', installationId: 456, installationAccount: 'company', installationType: 'Organization' },
    ];

    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          Try searching for "react", "vue", or "company"
        </p>
        <RepoSelectorModal
          open={true}
          onOpenChange={() => {}}
          repos={manyRepos}
          onConnect={(groups) => alert(`Connect: ${groups.flatMap(g => g.repoIds).join(', ')}`)}
          permissionsUrl="https://github.com/settings/installations"
        />
      </div>
    );
  },
};
