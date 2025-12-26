import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster, toast } from './toast';
import { Button } from './button';

const meta = {
  title: 'UI/Toast',
  component: Toaster,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="min-h-[400px] p-8">
        <Story />
        <Toaster />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive toast demo - click buttons to show toasts */
export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Click to show toasts:</h2>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast('This is a default toast')}>
          Default
        </Button>
        <Button
          onClick={() => toast.success('Connected 2 repositories')}
          className="bg-accent-orange hover:bg-accent-orange/90"
        >
          Success
        </Button>
        <Button
          onClick={() => toast.error('Failed to connect repository')}
          variant="destructive"
        >
          Error
        </Button>
        <Button
          onClick={() => toast.info('Analyzing in background...')}
          variant="secondary"
        >
          Info
        </Button>
        <Button
          onClick={() => toast.warning('Rate limit approaching')}
          variant="outline"
        >
          Warning
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-md font-medium mb-3">With Actions:</h3>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              toast.success('Analysis complete!', {
                description: '23 patterns discovered',
                action: {
                  label: 'View Patterns',
                  onClick: () => alert('Navigate to patterns'),
                },
              })
            }
            variant="outline"
          >
            Success with Action
          </Button>
          <Button
            onClick={() =>
              toast.success('Background analysis running...', {
                duration: Infinity,
                description: "We'll notify you when it's ready.",
              })
            }
            variant="outline"
          >
            Persistent Toast
          </Button>
        </div>
      </div>
    </div>
  ),
};

/** Success toast example */
export const Success: Story = {
  render: () => {
    // Trigger toast on mount
    setTimeout(() => {
      toast.success('Connected 2 repositories', {
        description: 'Starting analysis...',
      });
    }, 100);

    return (
      <div className="text-muted-foreground">
        Success toast appears in bottom-right
      </div>
    );
  },
};

/** Error toast example */
export const Error: Story = {
  render: () => {
    setTimeout(() => {
      toast.error('Failed to connect', {
        description: 'Rate limit exceeded. Try again later.',
      });
    }, 100);

    return (
      <div className="text-muted-foreground">
        Error toast appears in bottom-right
      </div>
    );
  },
};

/** Toast with action button */
export const WithAction: Story = {
  render: () => {
    setTimeout(() => {
      toast.success('dlombardi/api-server ready!', {
        description: '23 patterns discovered · 12 would have caught violations',
        action: {
          label: 'View Patterns',
          onClick: () => alert('Navigate to patterns page'),
        },
      });
    }, 100);

    return (
      <div className="text-muted-foreground">
        Toast with action button
      </div>
    );
  },
};
