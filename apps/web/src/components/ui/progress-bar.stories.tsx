import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './progress-bar';

const meta = {
  title: 'UI/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the progress bar',
    },
    variant: {
      control: 'select',
      options: ['default', 'success'],
      description: 'Color variant',
    },
    pulse: {
      control: 'boolean',
      description: 'Enable pulse animation',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default progress bar at 35% */
export const Default: Story = {
  args: {
    value: 35,
  },
};

/** Empty progress bar */
export const Empty: Story = {
  args: {
    value: 0,
  },
};

/** Half complete */
export const HalfComplete: Story = {
  args: {
    value: 50,
  },
};

/** Fully complete */
export const Complete: Story = {
  args: {
    value: 100,
  },
};

/** Success variant (green) when complete */
export const Success: Story = {
  args: {
    value: 100,
    variant: 'success',
  },
};

/** Small size */
export const Small: Story = {
  args: {
    value: 65,
    size: 'sm',
  },
};

/** With pulse animation */
export const Pulsing: Story = {
  args: {
    value: 45,
    pulse: true,
  },
};

/** Progress bar with all variants side by side */
export const AllVariants: Story = {
  args: {
    value: 50,
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Default (accent-orange)</p>
        <ProgressBar value={60} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Success (green)</p>
        <ProgressBar value={100} variant="success" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Small size</p>
        <ProgressBar value={75} size="sm" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Pulsing</p>
        <ProgressBar value={40} pulse />
      </div>
    </div>
  ),
};
