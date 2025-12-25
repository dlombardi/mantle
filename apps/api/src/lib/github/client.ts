import { App } from 'octokit';

let app: App | null = null;

/**
 * Get the GitHub App singleton instance.
 * Uses GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY from environment.
 *
 * Per Decision D15: We only store installationId, generating tokens on-demand.
 */
export function getGitHubApp(): App {
  if (!app) {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !privateKey) {
      throw new Error(
        'GitHub App credentials not configured. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.'
      );
    }

    app = new App({
      appId,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines from env
    });
  }
  return app;
}

/**
 * Get an authenticated Octokit instance for a specific installation.
 * This generates a fresh installation access token on each call.
 */
export async function getInstallationOctokit(installationId: number) {
  const githubApp = getGitHubApp();
  return githubApp.getInstallationOctokit(installationId);
}
