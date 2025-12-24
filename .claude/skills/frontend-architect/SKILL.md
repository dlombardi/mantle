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

### Optimistic Updates (tRPC)
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

### Optimistic Updates (React 19 useOptimistic)

For simpler UI-first updates, use React 19's `useOptimistic` hook:

```typescript
import { useOptimistic } from 'react';

interface Pattern {
  id: string;
  name: string;
  status: 'pending' | 'candidate' | 'authoritative';
}

function PatternList({ patterns }: { patterns: Pattern[] }) {
  const [optimisticPatterns, addOptimistic] = useOptimistic(
    patterns,
    (current, newPattern: Pattern) => [...current, newPattern]
  );

  async function handleCreate(formData: FormData) {
    const tempPattern: Pattern = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      status: 'pending',
    };

    addOptimistic(tempPattern); // Instant UI update
    await createPatternMutation(formData); // Server sync
  }

  return (
    <ul>
      {optimisticPatterns.map((p) => (
        <li
          key={p.id}
          className={p.status === 'pending' ? 'opacity-50' : ''}
        >
          {p.name}
        </li>
      ))}
    </ul>
  );
}
```

**When to use each:**
- **tRPC `onMutate`**: Complex cache updates, multiple query invalidations
- **`useOptimistic`**: Simple list additions, toggle states, UI-first feedback

### Prefetching
```typescript
// In route loader or on hover
const utils = trpc.useUtils();

// Prefetch data
await utils.patterns.list.prefetch({ repoId });
```

---

## The `use` API

React 19's `use` hook is unique—it can be called conditionally and in loops (unlike other hooks):

### Reading Promises Conditionally
```typescript
import { use, Suspense } from 'react';

interface Props {
  patternPromise: Promise<Pattern>;
  shouldLoad: boolean;
}

function PatternDetails({ patternPromise, shouldLoad }: Props) {
  if (!shouldLoad) {
    return <Placeholder />;
  }

  // ✅ Valid: `use` can be called inside conditions
  const pattern = use(patternPromise);
  return <PatternCard pattern={pattern} />;
}

// Wrap with Suspense for loading states
function PatternPage({ patternPromise }: { patternPromise: Promise<Pattern> }) {
  return (
    <Suspense fallback={<Spinner />}>
      <PatternDetails patternPromise={patternPromise} shouldLoad={true} />
    </Suspense>
  );
}
```

### Reading Context Conditionally
```typescript
import { use, createContext } from 'react';

const ThemeContext = createContext<'light' | 'dark'>('light');

function ConditionalTheme({ useCustomTheme }: { useCustomTheme: boolean }) {
  if (useCustomTheme) {
    // ✅ Valid: `use` works with context too
    const theme = use(ThemeContext);
    return <div className={`theme-${theme}`}>Custom themed content</div>;
  }
  return <div>Default content</div>;
}
```

**Caveat**: Promises passed to `use` must be stable across renders. Client-created promises recreate on every render—prefer passing promises from route loaders or parent components.

---

## Hook Anti-Patterns

Common mistakes to avoid when using React hooks:

### Invalid: Hooks in Conditions
```typescript
// ❌ INVALID: Hook call order changes between renders
if (isAdmin) {
  const [perms, setPerms] = useState(adminPerms);
}

// ✅ VALID: Conditional initial value
const [perms, setPerms] = useState(
  isAdmin ? adminPerms : userPerms
);
```

### Invalid: Hooks After Early Returns
```typescript
// ❌ INVALID: Hook may not execute
if (!data) return <Loading />;
const [processed, setProcessed] = useState(data);

// ✅ VALID: Move hook above the return
const [processed, setProcessed] = useState<Data | null>(null);
if (!data) return <Loading />;
```

### Invalid: Component Factories
```typescript
// ❌ INVALID: Creates new component identity each call
function createCard(type: string) {
  return function Card() {
    const [state, setState] = useState(); // Hooks break!
    return <div>{type}</div>;
  };
}

// ✅ VALID: Use props instead of factories
function Card({ type }: { type: string }) {
  const [state, setState] = useState();
  return <div>{type}</div>;
}
```

### Invalid: Hooks in Callbacks
```typescript
// ❌ INVALID: Hooks cannot be called inside event handlers
<button onClick={() => {
  const [clicked, setClicked] = useState(false); // Error!
}} />

// ✅ VALID: Declare hook at component top level
function Button() {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>Click me</button>;
}
```

---

## Context Optimization

Prevent unnecessary re-renders when using React Context:

```typescript
import { createContext, useCallback, useMemo, useState, useContext } from 'react';

interface AuthContextValue {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Stable function references with useCallback
  const login = useCallback(async (creds: Credentials) => {
    const response = await authApi.login(creds);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  // ✅ Memoized context value prevents child re-renders
  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

// Custom hook for consuming with null check
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Key principles:**
- Wrap functions in `useCallback` to maintain stable references
- Wrap the context value object in `useMemo`
- Only include values that actually change in the dependency array

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
