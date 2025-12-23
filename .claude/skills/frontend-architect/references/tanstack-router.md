# TanStack Router Patterns

Route file conventions and patterns for the web app.

## File-Based Routing

Routes are in `apps/web/src/routes/`:

```
routes/
├── __root.tsx           # Root layout
├── index.tsx            # / route
├── settings.tsx         # /settings route
├── settings/
│   ├── profile.tsx      # /settings/profile
│   └── preferences.tsx  # /settings/preferences
└── patterns/
    ├── index.tsx        # /patterns
    └── $id.tsx          # /patterns/:id (dynamic)
```

## Basic Route

```typescript
// routes/settings.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Settings</h1>
    </div>
  );
}
```

## Dynamic Routes

```typescript
// routes/patterns/$id.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/patterns/$id')({
  component: PatternDetailPage,
});

function PatternDetailPage() {
  const { id } = Route.useParams();
  return <div>Pattern: {id}</div>;
}
```

## Search Parameters

```typescript
// routes/patterns/index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/patterns/')({
  validateSearch: (search) => ({
    status: (search.status as string) || undefined,
    page: Number(search.page) || 1,
    pageSize: Number(search.pageSize) || 20,
  }),
  component: PatternsPage,
});

function PatternsPage() {
  const { status, page, pageSize } = Route.useSearch();
  // Use search params...
}
```

## Navigation

### Link Component
```typescript
import { Link } from '@tanstack/react-router';

<Link to="/settings">Settings</Link>

<Link
  to="/patterns"
  search={{ status: 'candidate', page: 1 }}
>
  View Candidates
</Link>
```

### Programmatic Navigation
```typescript
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: '/patterns',
      search: { status: 'active' }
    });
  };
}
```

## Root Layout

```typescript
// routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen">
      <nav className="border-b p-4">
        <Link to="/">Home</Link>
        <Link to="/patterns">Patterns</Link>
        <Link to="/settings">Settings</Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
```

## Loader Pattern (Future)

When TanStack Query is added:
```typescript
export const Route = createFileRoute('/patterns/')({
  loader: async () => {
    return queryClient.ensureQueryData(patternsQueryOptions());
  },
  component: PatternsPage,
});
```

## Route Tree Generation

The route tree is auto-generated:
- **Don't edit**: `src/routeTree.gen.ts`
- Routes are discovered from file structure
- Run `bun run dev` to regenerate on file changes
