---
name: frontend-architect
description: |
  Establishes frontend architecture patterns, component conventions, and React best practices
  for Reasoning Substrate. Consult this skill BEFORE building any UI components, pages, or
  client-side logic. Produces pattern documentation in docs/frontend/ and shared infrastructure
  in lib/components/ui/ and hooks/. Invoke when: starting UI work, making component structure
  decisions, choosing state management approaches, setting up data fetching patterns, or when
  any domain specialist needs guidance on React/Next.js implementation.
license: MIT
compatibility: Next.js 14+ with App Router, TypeScript, Tailwind CSS, React 18+
allowed-tools: Read Write Bash(npm:*) Glob Grep
metadata:
  role: consultant
  consulted-by: validation-ui-specialist, polish-specialist
  priority: phase-1
---

# Frontend Architect

## Purpose

Establish frontend patterns and conventions that all UI-building specialists follow. This skill produces documentation and shared infrastructure rather than owning specific feature tasks.

## When to Activate This Skill

- Beginning of project (Phase 1) to establish patterns before UI work begins
- Before any domain specialist builds UI components
- When new frontend patterns are needed
- When making architectural decisions about React/Next.js
- When unsure about Server vs Client Components

## Prerequisites

- Next.js 14 project initialized (via foundation-specialist)
- Tailwind CSS configured
- TypeScript strict mode enabled

## Workflow

### Step 1: Establish Component Patterns

1. Create `docs/frontend/component-patterns.md`
2. Define folder structure for components:
   ```
   components/
   ├── ui/           # Shared primitives (Button, Input, Modal)
   ├── patterns/     # Pattern-specific components
   ├── repos/        # Repository-specific components
   └── [domain]/     # Domain-grouped components
   ```
3. Document component composition patterns (compound components, render props, slots)
4. Create example compound component demonstrating the pattern
5. Document Server vs Client Component decision tree:
   - Server Components: Initial data fetching, static content, no interactivity
   - Client Components: Event handlers, state, browser APIs, real-time updates

### Step 2: Set Up Shared UI Primitives

Create minimal set of primitives in `lib/components/ui/`:

1. `button.tsx` - with variant styling using `cva`
2. `input.tsx` - form input with error state
3. `modal.tsx` - accessible dialog component
4. `dropdown.tsx` - accessible dropdown/select

Use `class-variance-authority` (cva) for variant styling:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Step 3: Define State Management Patterns

1. Create `docs/frontend/state-management.md`
2. Document when to use each approach:
   - **Local state (useState)**: Component-specific, doesn't need sharing
   - **URL state (nuqs)**: Filters, pagination, shareable state
   - **Form state (react-hook-form)**: Form inputs and validation
   - **Server state**: Data fetched from Supabase
   - **Real-time state**: Supabase Realtime subscriptions
3. Document optimistic update patterns
4. Document when NOT to use state (derive from props/URL instead)

### Step 4: Establish Data Fetching Patterns

1. Create `docs/frontend/data-fetching.md`
2. Document Server Component data fetching:
   ```typescript
   // app/patterns/page.tsx (Server Component)
   import { createServerClient } from '@/lib/supabase/server';

   export default async function PatternsPage() {
     const supabase = createServerClient();
     const { data: patterns } = await supabase.from('patterns').select('*');
     return <PatternList patterns={patterns} />;
   }
   ```
3. Set up Supabase Realtime subscription patterns for status updates
4. Create shared hooks: `useRealtimeSubscription`, `useOptimisticUpdate`
5. Document loading/error boundary usage with Suspense

### Step 5: Forms and Validation

1. Create `docs/frontend/forms-validation.md`
2. Configure react-hook-form with Zod:
   ```typescript
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { patternSchema } from '@/lib/types/pattern';

   const form = useForm({
     resolver: zodResolver(patternSchema),
   });
   ```
3. Create shared form components that integrate with react-hook-form
4. Document Zod schema sharing between frontend and backend

### Step 6: Accessibility Standards

1. Create `docs/frontend/accessibility.md`
2. Document keyboard navigation requirements (critical for triage queue: j/k/p/r/d)
3. Create `hooks/use-keyboard-navigation.ts` utility
4. Document ARIA patterns for complex widgets
5. Document focus management for modals and dialogs

## Output Specification

After running this skill, the following should exist:

### Documentation
- `docs/frontend/component-patterns.md`
- `docs/frontend/state-management.md`
- `docs/frontend/data-fetching.md`
- `docs/frontend/forms-validation.md`
- `docs/frontend/accessibility.md`

### Shared Infrastructure
- `lib/components/ui/button.tsx`
- `lib/components/ui/input.tsx`
- `lib/components/ui/modal.tsx`
- `lib/components/ui/dropdown.tsx`
- `hooks/use-keyboard-navigation.ts`
- `hooks/use-realtime-subscription.ts`
- `hooks/use-debounce.ts`

## Consultation Protocol

Domain specialists should:

1. **Read** relevant `docs/frontend/*.md` before starting UI work
2. **Use** primitives from `lib/components/ui/`
3. **Follow** established patterns exactly
4. **Request** new patterns if needed (don't invent ad-hoc solutions)

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Form library | react-hook-form | Best DX, Zod integration, minimal re-renders |
| Validation | Zod | Shared with backend, TypeScript-first |
| Data fetching | Server Components + Supabase Realtime | Optimal for initial load + real-time updates |
| UI primitives | Minimal set, extend as needed | Avoid premature abstraction |
| Keyboard nav | Custom hook | Core UX for triage queue |
| Styling | Tailwind + cva | Consistent variants, no CSS-in-JS overhead |

## Success Signals

- Domain specialists can build UI without making architecture decisions
- Consistent patterns across all pages
- No conflicting approaches in codebase
- Keyboard navigation works throughout application

## Handoffs

- **Patterns established** → validation-ui-specialist and polish-specialist can build
- **Patterns need update** → Return to this skill to document new patterns
