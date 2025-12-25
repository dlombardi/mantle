import { useNavigate } from '@tanstack/react-router';
import { Github } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, Button, Switch } from '@/components/ui';
import { SettingsSection, SettingsRow } from '@/components/settings';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const username = user?.user_metadata?.user_name || 'User';
  const email = user?.email || 'No email';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/' });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <SettingsSection title="Profile" description="Your account information">
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl} alt={username} fallback={username} size="lg" />
          <div className="space-y-1">
            <p className="font-medium">{username}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Github className="h-3 w-3" />
              <span>Connected via GitHub</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection
        title="Notifications"
        description="Configure how you receive updates"
      >
        <SettingsRow
          label="Email notifications"
          description="Receive emails about pattern updates"
        >
          <div className="flex items-center gap-2">
            <Switch disabled />
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </SettingsRow>

        <SettingsRow
          label="PR review alerts"
          description="Get notified when patterns are flagged in PRs"
        >
          <div className="flex items-center gap-2">
            <Switch disabled />
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </SettingsRow>

        <SettingsRow
          label="Weekly digest"
          description="Summary of pattern activity across your repos"
        >
          <div className="flex items-center gap-2">
            <Switch disabled />
            <span className="text-xs text-muted-foreground">Coming soon</span>
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone" variant="danger">
        <SettingsRow
          label="Sign out"
          description="Sign out of your account on this device"
        >
          <Button variant="destructive" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </SettingsRow>
      </SettingsSection>
    </div>
  );
}
