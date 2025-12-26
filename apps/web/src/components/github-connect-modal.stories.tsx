import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { GitHubConnectModal } from './github-connect-modal';
import { Button } from './ui/button';

const meta = {
  title: 'Components/GitHubConnectModal',
  component: GitHubConnectModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    open: true,
    onOpenChange: () => {},
    onContinue: () => {},
  },
  argTypes: {
    onContinue: { action: 'continue' },
    onOpenChange: { action: 'openChange' },
  },
} satisfies Meta<typeof GitHubConnectModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default modal state */
export const Default: Story = {
  args: {
    loading: false,
  },
};

/** Loading state after clicking Continue */
export const Loading: Story = {
  args: {
    loading: true,
  },
};

/** Interactive demo with trigger button */
export const Interactive: Story = {
  args: {
    open: false,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleContinue = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
        alert('Would redirect to GitHub...');
      }, 1500);
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>
          Connect GitHub
        </Button>
        <GitHubConnectModal
          open={open}
          onOpenChange={setOpen}
          onContinue={handleContinue}
          loading={loading}
        />
      </>
    );
  },
};

/** Modal in context - simulates empty dashboard */
export const InContext: Story = {
  args: {
    open: false,
  },
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div className="relative min-h-[500px] w-[800px] bg-background border rounded-lg p-8">
        {/* Simulated dashboard content */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Mantle</p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No repositories connected</p>
          <Button onClick={() => setOpen(true)}>
            Connect Repository
          </Button>
        </div>

        <GitHubConnectModal
          open={open}
          onOpenChange={setOpen}
          onContinue={() => alert('Redirect to GitHub')}
        />
      </div>
    );
  },
};
