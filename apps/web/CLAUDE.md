# Web Development Context

Vite + React + TanStack Router frontend for the Reasoning Substrate.

## Quick Reference

| Pattern | Example |
|---------|---------|
| Route file | `createFileRoute('/path')({ component: Page })` |
| Navigation | `<Link to="/path">` or `useNavigate()` |
| Search params | `Route.useSearch()` |
| Env vars | Must prefix with `VITE_` |

## Key Patterns

**Route Files** - TanStack Router file-based routing:
```typescript
// routes/settings.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return <div>Settings</div>;
}
```

**URL Search Params**:
```typescript
export const Route = createFileRoute('/patterns')({
  validateSearch: (search) => ({
    status: search.status as string | undefined,
    page: Number(search.page) || 1,
  }),
  component: PatternsPage,
});

function PatternsPage() {
  const { status, page } = Route.useSearch();
}
```

**Components** - Props interface + Tailwind:
```typescript
interface ButtonProps {
  onClick?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ onClick, loading, children }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
```

**Data Fetching** - Via Supabase client or API proxy:
```typescript
// Supabase direct
import { getSupabaseClient } from '@/lib/supabase';
const supabase = getSupabaseClient();

// API proxy (calls apps/api)
const response = await fetch('/api/patterns');
```

## Commands

```bash
bun run dev          # Start dev server (port 3000)
bun run typecheck    # Type check
bun run build        # Production build
bun run preview      # Preview production build
```

## File Structure

```
src/
├── main.tsx              # Entry point
├── routeTree.gen.ts      # Auto-generated (don't edit)
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx        # Root layout
│   └── index.tsx         # / route
├── components/           # React components
│   └── ui/               # Primitives (Button, Input)
├── hooks/                # Custom React hooks
├── lib/
│   └── supabase.ts       # Supabase client singleton
└── styles/
    └── index.css         # Tailwind + global styles
```
