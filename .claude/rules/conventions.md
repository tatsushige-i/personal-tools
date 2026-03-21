# Project-Specific Conventions

## Testing Conventions

### Test File Placement

Place test files in a `__tests__/` directory adjacent to the file under test.

```
src/components/__tests__/theme-toggle.test.tsx   ← test for src/components/theme-toggle.tsx
src/features/xxx/lib/__tests__/utils.test.ts     ← test for src/features/xxx/lib/utils.ts
```

### Naming Rules

- Test files: `<target-file-name>.test.ts(x)`
- Use `.test.tsx` for TSX component tests, `.test.ts` for pure logic tests

### Testing Policy

- Write **user-perspective (behavioral) tests**. Do not test internal implementation details.
- Use **role** and **accessible name** for element queries (`getByRole`, `getByLabelText`, etc.).
- Use test IDs or class names only as a last resort.

### Required Test Targets

- **Logic layer** (`features/xxx/lib/`): business logic and data transformations
- **Interactive UI components**: components involving user interactions
- **Shared components** (`src/components/`): components used in multiple places

### Optional Test Targets

- **Pure display components**: components that only receive props and render output

### Coverage Goals

- Coverage target: **80%** (logic layer and shared components)
- Pure display components may be excluded from coverage targets

### Mandatory Test Execution

- `npm run test` is a required check step alongside `build` and `lint`
- Confirm tests pass locally before submitting a PR
