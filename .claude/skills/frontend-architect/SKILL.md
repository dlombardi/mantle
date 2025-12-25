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

## Tech Stack

| Layer | Technology |
|-------|------------|
| Bundler | Vite 6.0 |
| Framework | React 19.x |
| Routing | TanStack Router (file-based) |
| Data | tRPC + React Query |
| Forms | Native actions + react-hook-form (complex) |
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

## Component Creation Guidelines

When a new UI component is needed:

1. **Always check @base-ui/react first via Ref**
   ```
   ref_search_documentation("base-ui react [component type] props API")
   ref_read_url("https://base-ui.com/react/components/[name]")
   ```

2. **Check existing wrappers** in `apps/web/src/components/ui/`
   - Currently available: `Button`, `Checkbox`, `Dialog`, `Switch`

3. **Create wrapper if needed** following our pattern:
   - Import from `@base-ui/react/<component>`
   - Add Tailwind styling with variant/size props
   - Use `cn()` utility for class merging

4. **Only create custom components** when base-ui lacks a suitable primitive

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

### React 19 Native Form Actions

For simple server mutations, use React 19's native form actions with `useActionState`:

```typescript
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

function AddPatternForm({ repoId }: { repoId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: string | null, formData: FormData) => {
      const name = formData.get('name') as string;
      const result = await createPattern({ repoId, name });
      return result.error ?? 'Pattern created successfully';
    },
    null
  );

  return (
    <form action={formAction}>
      <input name="name" required placeholder="Pattern name" />
      <SubmitButton />
      {state && <p className="text-sm mt-2">{state}</p>}
    </form>
  );
}

// useFormStatus MUST be in a child component
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Pattern'}
    </button>
  );
}
```

**When to use each approach:**
- **Native actions**: Simple forms, server mutations, progressive enhancement
- **react-hook-form**: Complex validation, multi-step forms, dynamic fields

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

For tRPC cache management (`onMutate`, `setData`), use Ref:
```
ref_search_documentation("tRPC React Query optimistic updates")
```

For React 19's `useOptimistic`, use Ref:
```
ref_search_documentation("React 19 useOptimistic")
```

### Prefetching
```typescript
// In route loader or on hover
const utils = trpc.useUtils();

// Prefetch data
await utils.patterns.list.prefetch({ repoId });
```

---

## React 19 Patterns

For React 19 patterns (`use`, `useActionState`, `useOptimistic`, hook rules), use Ref:
```
ref_search_documentation("React 19 [pattern name]")
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

## Phase 2 Completion Checklist

When implementing a bead, complete ALL items before considering Phase 2 done:

- [ ] Code changes implemented per `plan.md`
- [ ] Unit/component tests written and passing
- [ ] TypeScript and lint checks pass
- [ ] `.beads/artifacts/<bead-id>/qa-checklist.md` created (see template below)
- [ ] Changes committed and pushed to trigger preview deployment

**Then transition to Phase 3:**
```bash
bd label add <bead-id> phase:verifying
```

**HANDOFF TO: qa-workflow** - Do NOT close the bead until Phase 3 completes.

### qa-checklist.md Template

```markdown
# QA Checklist: <bead-title>

## Prerequisites
- [ ] Preview deployment is live
- [ ] Test user can access the preview URL

## Functional Tests
1. [ ] <Step 1 description>
2. [ ] <Step 2 description>
3. [ ] <Expected outcome>

## Edge Cases
- [ ] <Edge case 1>
- [ ] <Edge case 2>

## Regression Checks
- [ ] Existing functionality still works
- [ ] No console errors
```

---

## Handoffs

| Downstream | When |
|------------|------|
| `testing-consultant` | For component tests |
| `api-backend` | When UI needs new API endpoints |
| `qa-workflow` | After Phase 2 complete, for verification |

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes UI tasks here |
