# SKILLS.md

## Purpose

This file is a lightweight skill map for the Aries React frontend.
It highlights recurring workflows that are easy to repeat consistently.

`AGENTS.md` contains repository rules.
`SKILLS.md` contains project workflows.

## Suggested Project Skills

### 1. Add A New API Resource Flow

Use when:

- adding a new endpoint to the frontend
- wiring a new list/detail/create flow

Workflow:

1. Define or extend the TypeScript model in `src/types/aries-proxy`.
2. Add the raw HTTP call in `src/proxies/aries-proxy/api`.
3. Add a React Query hook in `src/proxies/aries-proxy`.
4. Consume the hook in the view or modal.

### 2. Add A List View

Use when:

- building a new entity list page

Common repo pattern:

- route-level file under `src/views/.../...View.tsx`
- small local `components` folder for row, heading, filters, bar
- `react-virtuoso` for table virtualization
- shared table primitives from `src/components/Table`
- metadata/filter bar above the table

### 3. Add A Modal Workflow

Use when:

- creating a modal for create/update/confirm flows

Preferred approach:

- keep the modal component mostly presentational
- place API interaction in proxy hooks or small helper logic
- use typed props and predictable close actions
- reuse the existing dialog/button patterns from `src/components/Modals`

Good candidate:

- `CreateSystemSubscriptionModal`

### 4. Add A Route

Use when:

- introducing a new page

Workflow:

1. Add the route to `src/routes/routeConfig.ts`.
2. Add the route element to router setup.
3. Use `buildLink(...)` from `RouteConfig` in navigation code.

Avoid:

- hand-assembling route strings in multiple files

### 5. Add A Form

Use when:

- building non-trivial user input flows

Preferred stack:

- React Hook Form
- Zod when validation matters
- MUI form controls

Keep:

- parsing/validation close to the form
- request transformation out of JSX where possible

### 6. Extend The Theme

Use when:

- a UI change should become reusable

Workflow:

1. Check `src/styles/theme/palette.ts`
2. Check `src/styles/theme/overrides`
3. Only add local styling if the change is truly local

Avoid:

- ad hoc style duplication across many views

### 7. Debug Frontend/Backend Contract Mismatches

Use when:

- the backend shape changed
- include names or payload keys changed
- form submits fail after backend updates

Checklist:

1. Check `src/types/aries-proxy`
2. Check `src/proxies/aries-proxy/api`
3. Check Axios object mapping in `src/clients`
4. Check whether the backend returns snake_case transformed by the client layer

### 8. Validate A Change Safely

Use when:

- finishing a frontend change

Recommended order:

1. `npm run typelint`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

## Best Candidates For Future Formal Skills

- `aries-react-api-resource`
- `aries-react-list-view`
- `aries-react-modal-flow`
- `aries-react-route-addition`
- `aries-react-backend-contract-check`

If these workflows keep recurring, they can later be promoted into formal Codex skills with dedicated `SKILL.md` folders.
