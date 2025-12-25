# GitHub App Setup

This guide explains how to set up the GitHub App for Reasoning Substrate development.

## Shared Dev App (Recommended)

For most development work, use the shared dev app credentials. Ask a team member for the `.env.local` values:

```bash
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
```

The shared app points to the Vercel preview environment, so webhooks work automatically when testing against preview.

## Creating Your Own App (Optional)

If you need your own app (e.g., for webhook testing on localhost), follow these steps:

### 1. Create the App

Go to: https://github.com/settings/apps/new

Fill in:

| Field | Value |
|-------|-------|
| **App name** | `Reasoning Substrate (Dev - YourName)` |
| **Homepage URL** | `http://localhost:3000` |
| **Callback URL** | `http://localhost:3000/auth/callback` |
| **Webhook URL** | Your ngrok/tunnel URL + `/api/webhooks/github` |
| **Webhook secret** | Generate with `openssl rand -hex 32` |

### 2. Set Permissions

**Repository permissions:**
- Contents: Read-only
- Commit statuses: Read and write
- Metadata: Read-only
- Pull requests: Read and write

**Account permissions:**
- Email addresses: Read-only

**Subscribe to events:**
- Pull request
- Push

### 3. Generate Credentials

After creating the app:

1. Note the **App ID** at the top of the page
2. Note the **Client ID**
3. Click "Generate a new client secret" — copy immediately
4. Click "Generate a private key" — downloads a `.pem` file

### 4. Format Private Key

The private key must be a single line with `\n` escape sequences:

```bash
cat ~/Downloads/your-app.private-key.pem | awk 'NF {sub(/\r/, ""); printf "%s\\n",$0}'
```

Copy the output.

### 5. Add to .env.local

```bash
GITHUB_APP_ID=<app-id>
GITHUB_APP_PRIVATE_KEY=<formatted-key-from-step-4>
GITHUB_CLIENT_ID=<client-id>
GITHUB_CLIENT_SECRET=<client-secret>
GITHUB_WEBHOOK_SECRET=<webhook-secret>
```

## Local Webhook Testing

GitHub needs to reach your localhost for webhooks. Options:

### ngrok (Recommended)

```bash
# Install
brew install ngrok

# Start tunnel
ngrok http 3001

# Use the https URL as your webhook URL
# e.g., https://abc123.ngrok.io/api/webhooks/github
```

### Cloudflare Tunnel

```bash
# Install
brew install cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3001
```

Update your GitHub App's webhook URL to the tunnel URL.

## Using the Private Key in Code

When reading the private key from environment variables, convert `\n` to actual newlines:

```typescript
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
```

## Production App

The production GitHub App (`Reasoning Substrate`) will be created during production deployment. It will point to the production domain and have its credentials stored in the production environment.
