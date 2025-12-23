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
| Styling | Tailwind CSS + Inter font |
| Data | Supabase client |
| Types | TypeScript strict mode |

---

## File Structure

```
apps/web/src/
├── main.tsx              # Entry point, router setup
├── routeTree.gen.ts      # Auto-generated (don't edit)
├── routes/               # TanStack Router file-based routes
│   ├── __root.tsx        # Root layout
│   ├── index.tsx         # / route
│   └── [feature]/        # Feature routes
├── components/           # Shared React components
│   ├── ui/               # Primitives (Button, Input, Modal)
│   └── [feature]/        # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
│   └── supabase.ts       # Supabase client singleton
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

## Data Fetching

### Supabase Client
```typescript
import { getSupabaseClient } from '@/lib/supabase';

async function fetchPatterns(repoId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('patterns')
    .select('*')
    .eq('repo_id', repoId);

  if (error) throw error;
  return data;
}
```

### API Proxy
Vite proxies `/api/*` to the backend:
```typescript
// Calls apps/api via proxy
const response = await fetch('/api/patterns');
const data = await response.json();
```

### Future: TanStack Query
When TanStack Query is added:
```typescript
import { useQuery } from '@tanstack/react-query';

function usePatterns(repoId: string) {
  return useQuery({
    queryKey: ['patterns', repoId],
    queryFn: () => fetchPatterns(repoId),
  });
}
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
