# Frontend Architect

Establishes frontend architecture patterns for Vite + React + TanStack Router.

---

## Activation

Invoke this skill when working on:
- React component architecture and patterns
- TanStack Router routing and navigation
- State management decisions
- Data fetching patterns
- Form handling and validation
- UI component structure

**Trigger keywords:** `component`, `useState`, `useQuery`, `tsx`, `props`, `hook`, `route`, `navigate`

**Example triggers:**
- "Create a PatternCard component for displaying patterns"
- "Add a new route for the settings page"
- "Implement URL search params for filtering patterns"
- "Build a form for editing user preferences"
- "Add loading and error states to the pattern list"

**Key files:**
- `apps/web/src/routes/`
- `apps/web/src/components/`
- `apps/web/src/hooks/`
- `apps/web/src/lib/`

---

## Beads Integration

Track frontend work with beads:
```bash
# Starting a new page/feature
bd create "Build settings page with user preferences"
bd update <id> -s in-progress

# Track dependent work
bd create "Add form validation to settings"
bd dep add <validation-id> <page-id>

# Complete when working
bun run typecheck && bd complete <id>
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Bundler | Vite 6.0 |
| Framework | React 18.3 |
| Routing | TanStack Router (file-based) |
| Data | tRPC + React Query |
| Styling | Tailwind CSS + Inter font |
| Types | TypeScript strict mode |

---

## File Structure

```
apps/web/src/
├── main.tsx              # Entry point, tRPC + router setup
├── routeTree.gen.ts      # Auto-generated (don't edit)
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx        # Root layout
│   ├── index.tsx         # / route
│   └── [feature]/        # Feature routes
├── components/           # Shared React components
│   ├── ui/               # Primitives (Button, Input, Modal)
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/
│   ├── trpc.ts           # tRPC React client
│   └── supabase.ts       # Supabase client (auth only)
└── styles/
    └── index.css         # Tailwind + global styles
```

---

## Routing Patterns

### Route File Convention
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

### Nested Routes
```
routes/
├── settings.tsx              # /settings
├── settings/
│   ├── profile.tsx           # /settings/profile
│   └── preferences.tsx       # /settings/preferences
```

### Type-Safe Navigation
```typescript
import { Link, useNavigate } from '@tanstack/react-router';

// Link component
<Link to="/settings/profile">Profile</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/settings', search: { tab: 'profile' } });
```

### URL Search Params
```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/patterns')({
  validateSearch: (search) => ({
    status: search.status as string | undefined,
    page: Number(search.page) || 1,
  }),
  component: PatternsPage,
});

function PatternsPage() {
  const { status, page } = Route.useSearch();
  // Use status and page...
}
```

---

## Component Patterns

### File Naming
- Components: `PascalCase.tsx` (e.g., `PatternCard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-keyboard-nav.ts`)
- Utils: `kebab-case.ts` (e.g., `format-date.ts`)

### Component Structure
```typescript
// components/patterns/PatternCard.tsx
interface PatternCardProps {
  pattern: Pattern;
  onSelect?: (id: string) => void;
}

export function PatternCard({ pattern, onSelect }: PatternCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{pattern.name}</h3>
      <p className="text-sm text-gray-600">{pattern.description}</p>
    </div>
  );
}
```

### Styling with Tailwind
- Use utility classes directly in JSX
- Group related utilities with line breaks for readability
- Use `className` prop for customization

```typescript
<button
  className={`
    inline-flex items-center justify-center
    rounded-md px-4 py-2
    bg-blue-600 text-white
    hover:bg-blue-700
    disabled:opacity-50
  `}
>
  Submit
</button>
```

---

## State Management

### Local State (useState)
Use for component-specific state that doesn't need sharing:
```typescript
const [isOpen, setIsOpen] = useState(false);
```

### URL State (TanStack Router)
Use for filterable/shareable state:
```typescript
// Search params are automatically synced with URL
const { status, page } = Route.useSearch();
const navigate = useNavigate();

// Update URL state
navigate({ search: { status: 'active', page: 1 } });
```

### Form State (react-hook-form + Zod)
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

function SettingsForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => { /* ... */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

---

## Data Fetching with tRPC

### Query Pattern
```typescript
import { trpc } from '@/lib/trpc';

function PatternList({ repoId }: { repoId: string }) {
  const { data, isLoading, error } = trpc.patterns.list.useQuery({
    repoId,
    status: 'candidate',
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <ul>
      {data?.items.map((pattern) => (
        <PatternCard key={pattern.id} pattern={pattern} />
      ))}
    </ul>
  );
}
```

### Mutation Pattern
```typescript
function PromoteButton({ patternId }: { patternId: string }) {
  const utils = trpc.useUtils();

  const { mutate, isPending } = trpc.patterns.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate queries to refetch
      utils.patterns.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <button
      onClick={() => mutate({ id: patternId, status: 'authoritative' })}
      disabled={isPending}
    >
      {isPending ? 'Promoting...' : 'Promote to Authoritative'}
    </button>
  );
}
```

### Optimistic Updates
```typescript
const { mutate } = trpc.patterns.updateStatus.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.patterns.list.cancel();

    // Snapshot previous value
    const previousData = utils.patterns.list.getData();

    // Optimistically update
    utils.patterns.list.setData(undefined, (old) => ({
      ...old,
      items: old?.items.map((p) =>
        p.id === newData.id ? { ...p, status: newData.status } : p
      ),
    }));

    return { previousData };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    utils.patterns.list.setData(undefined, context?.previousData);
  },
});
```

### Prefetching
```typescript
// In route loader or on hover
const utils = trpc.useUtils();

// Prefetch data
await utils.patterns.list.prefetch({ repoId });
```

---

## Validation Commands

```bash
bun run typecheck    # TypeScript check
bun run lint         # ESLint
bun run build        # Production build
bun run dev          # Development server (port 3000)
```

---

## Handoffs

| Downstream | When |
|------------|------|
| `testing-consultant` | For component tests |
| `backend-architect` | When UI needs new API endpoints |
| `hono-specialist` | For specific API route implementation |

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes UI tasks here |
