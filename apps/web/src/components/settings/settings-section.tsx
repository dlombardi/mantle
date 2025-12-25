import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

export function SettingsSection({
  title,
  description,
  children,
  variant = 'default',
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'rounded-lg border bg-card p-6',
        variant === 'danger' && 'border-destructive/50'
      )}
    >
      <div className="mb-4">
        <h2
          className={cn(
            'text-lg font-semibold',
            variant === 'danger' && 'text-destructive'
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
