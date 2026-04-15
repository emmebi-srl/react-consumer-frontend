# AGENTS.md

## Purpose

This repository is the Aries React frontend.
It is a Vite + React + TypeScript application with MUI, React Query, React Router, React Hook Form, Zod, and Axios-based API clients.

This file defines project-specific guardrails so changes stay consistent with the codebase.

## Project Shape

- `src/views`
  Route-level screens and page composition.

- `src/components`
  Reusable UI building blocks.

- `src/components/Modals`
  Shared modal components.

- `src/routes`
  Router setup, guards, and route definitions.

- `src/proxies/aries-proxy/api`
  Raw API calls.

- `src/proxies/aries-proxy`
  React Query hooks and higher-level client-facing wrappers.

- `src/types/aries-proxy`
  API-facing TypeScript models.

- `src/clients`
  Axios clients and request/response interception.

- `src/styles/theme`
  MUI theme, palette, and component overrides.

- `src/utils`
  Narrow helpers only. Keep them focused and reusable.

## Core Stack

- React 19
- TypeScript 5
- Vite 8
- MUI 7
- TanStack React Query 5
- React Router 7
- React Hook Form 7
- Zod 4
- Vitest

## Routing Rules

- Define routes through `src/routes/routeConfig.ts`.
- Prefer using `RouteConfig.<Route>.buildLink(...)` instead of hand-building paths.
- Keep route guards in `src/routes`, not inside views.
- Treat `views` as route-level entry points and keep most reusable UI in `components`.

## API And Data Rules

- Raw HTTP calls belong in `src/proxies/aries-proxy/api`.
- React Query hooks belong in `src/proxies/aries-proxy`.
- Shared response/request types belong in `src/types/aries-proxy`.
- Use the existing Axios clients in `src/clients`.
- Respect the request/response object mapping already handled by the clients.

Preferred flow:

1. Add/update TypeScript models in `src/types/aries-proxy`.
2. Add/update raw API call in `src/proxies/aries-proxy/api`.
3. Add/update React Query hook in `src/proxies/aries-proxy`.
4. Consume the hook from a view or component.

Avoid:

- calling Axios directly from views
- duplicating API paths in multiple files
- mixing response shaping into route components when it belongs in hooks/helpers

## UI Rules

- Use MUI components and the shared theme before introducing custom styling patterns.
- Prefer existing layout primitives such as `PageContainer`, table components, filters, and shared labels.
- Reuse existing modal patterns from `src/components/Modals`.
- Keep route views focused on composition; extract repeatable sections into local `components` folders when they grow.

## Forms And Mutations

- Prefer React Hook Form for non-trivial forms.
- Prefer Zod for request validation/parsing when the form has real rules.
- Keep mutation logic close to the proxy hook layer, not inline in large UI components.
- For modal-based create/update flows, keep the modal UI small and move API wiring into hooks/helpers where possible.

## Naming And File Organization

- Keep file and component names in English.
- Use one main component per file where practical.
- Put route-specific helper components under the local `views/.../components` folder.
- Put generic reusable components under `src/components`.
- Keep types in `src/types`, not mixed into view files unless they are strictly local.

## Existing Patterns To Preserve

- `~` path alias points to `src`
- table/list views often use `react-virtuoso`
- filters are usually split into small reusable components
- route-level list screens commonly use a `View + local components + local state` structure
- token refresh is handled by the Axios/auth client layer

## Validation

Use these commands for verification:

```powershell
npm run typelint
npm run lint
npm run test
npm run build
```

Prefer the smallest useful validation set for the files you changed, but do not skip `typelint` when touching TypeScript-heavy flows.

## What To Avoid

- Do not introduce a second API access pattern when `clients` + `proxies` already cover it.
- Do not hardcode routes when `RouteConfig` already models them.
- Do not move shared UI concerns into route files if they are reusable.
- Do not create frontend-only data shapes when the existing `types/aries-proxy` model can be extended cleanly.
- Do not bypass the shared Axios clients for authenticated requests.
- Do not add new styling systems or one-off UI conventions unless the repo clearly needs them.

## Notes For Subscription Work

There is already a placeholder modal at:

- `src/components/Modals/CreateSystemSubscriptionModal/index.tsx`

When extending system subscription flows:

- keep API integration aligned with the `proxies` pattern
- prefer dedicated typed models in `src/types/aries-proxy/systems.ts` or `shared.ts` as appropriate
- keep modal UX thin and avoid burying domain logic in the JSX file
