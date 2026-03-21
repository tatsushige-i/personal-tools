# Architecture Rules

## Layer Separation

Strictly separate routing, UI, and logic into three layers:

- `app/tools/xxx/page.tsx` — **Route layer**. Keep it thin. Only import from `features/` and compose components. No business logic.
- `features/xxx/components/` — **UI layer**. Presentation-only React components. Receive data via props. No direct data fetching or API calls.
- `features/xxx/lib/` — **Logic layer**. All data fetching, transformation, and business logic goes here. When changing data sources (e.g., adding a database), only this layer should be modified.

## Directory Responsibilities

- `src/components/ui/` — Shared UI components managed by shadcn/ui. Do not manually edit generated files. Add with `npx shadcn@latest add <component>`.
- `src/components/` (non-ui) — Project-wide shared components (navigation, layout parts, etc.).
- `src/components/__tests__/` — Tests for shared components.
- `src/features/<tool>/` — Tool-specific code. Cross-feature imports are prohibited. Extract shared code to `src/lib/` or `src/components/`.
- `src/features/<tool>/lib/__tests__/` — Tests for the logic layer.
- `src/lib/` — Shared utilities and helpers used across multiple features.

## Rules

1. **No cross-feature imports.** Do not import from `features/b/` within `features/a/`. Place shared code in `src/lib/` or `src/components/`.
2. **Keep route files thin.** `app/**/page.tsx` should contain minimal code — imports, Server Component data fetching if needed, and component composition only.
3. **Explicit Client Components.** Use `"use client"` only when browser APIs or interactivity are required. Default to Server Components.
4. **Colocate tool code.** All code for a tool goes under `features/<tool-name>/`. Do not scatter it across unrelated directories.
5. **Backend logic in API routes.** Use `app/api/` Route Handlers for server-side logic (database, external APIs).
6. **Use shadcn/ui components.** Use or add shadcn/ui for standard UI elements (buttons, cards, dialogs, etc.). Do not build custom alternatives.
7. **Use the `@/` import alias.** Always use the `@/` prefix for imports (e.g., `@/components/ui/button`). Relative imports above the current feature are prohibited.

## Adding a New Tool

### Overview

1. Create `src/features/<tool-name>/components/` and `src/features/<tool-name>/lib/`
2. Create `src/app/tools/<tool-name>/page.tsx` and import from the feature
3. Add a tool entry to the `tools` array in `src/app/page.tsx`

### Scaffold Template

When adding a new tool via a `feature`-labeled Issue, generate files using the following templates.

**`src/app/tools/<tool>/page.tsx`** (route file):
```tsx
import { <ToolName>Page } from "@/features/<tool>/components/<tool>-page";

export default function Page() {
  return <<ToolName>Page />;
}
```

**`src/features/<tool>/components/<tool>-page.tsx`** (main component):
```tsx
"use client";

export function <ToolName>Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight"><Tool Display Name></h1>
      <p className="mt-2 text-muted-foreground">
        TODO: Tool description
      </p>
    </div>
  );
}
```

**`src/features/<tool>/lib/types.ts`** (type definitions):
```ts
// TODO: Tool-specific type definitions
```

**`src/app/page.tsx`** (add entry to `tools` array):
```ts
{
  name: "<Tool Display Name>",
  description: "TODO: Tool description",
  href: "/tools/<tool>",
  icon: Package,
},
```
Note: The `Package` icon requires an import from `lucide-react`. Add the import if not already present.
