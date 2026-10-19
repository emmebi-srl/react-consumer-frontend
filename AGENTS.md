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
- Do not invent local date/currency formatters inside views or modals when shared utilities already exist.
- For money formatting, reuse the helpers in `src/utils/money`.
- For backend date formatting/parsing, reuse the helpers in `src/utils/datetime-utils`.
- Aries backend `DateTime` values are serialized as Unix timestamps in seconds from `1970-01-01T00:00:00Z`, so frontend API-facing date fields should normally be typed as `number`, not `string`.
- Do not use `new Date(apiValue)` directly on Aries API date fields unless you have first verified that the specific endpoint returns an ISO string instead of the standard Unix-seconds contract.
- When converting an Aries API timestamp for rendering or sorting, prefer `getDateByUnixtimestamp({ unixTimestamp })` from `src/utils/datetime-utils` instead of `new Date(...)`.
- If a response model in `src/types/aries-proxy` represents a standard Aries API date, type it as `number`, not `number | string`.

Preferred flow:

1. Add/update TypeScript models in `src/types/aries-proxy`.
2. Add/update raw API call in `src/proxies/aries-proxy/api`.
3. Add/update React Query hook in `src/proxies/aries-proxy`.
4. Consume the hook from a view or component.

Avoid:

- calling Axios directly from views
- duplicating API paths in multiple files
- mixing response shaping into route components when it belongs in hooks/helpers
- assuming the backend will add a dedicated `latest` or `by-system/{id}` route when the existing searchable `GET` endpoint can already support filters and ordering
- adding one-off `formatCurrency`, `formatDate`, or `formatDateTime` helpers inside components when the repo already has shared utils for that concern

When a backend resource exposes both a legacy endpoint and a newer `/new` endpoint:

- prefer `/new` for React flows unless a screen explicitly needs the legacy mobile contract
- keep the response wrapper from the backend visible in `src/types/aries-proxy`
- flatten it in the proxy hook only if that makes component consumption simpler

## UI Rules

- Use MUI components and the shared theme before introducing custom styling patterns.
- Prefer existing layout primitives such as `PageContainer`, table components, filters, and shared labels.
- Reuse existing modal patterns from `src/components/Modals`.
- Keep route views focused on composition; extract repeatable sections into local `components` folders when they grow.

### Delphi Colors

Some data carries colors written by the Delphi desktop app, in Delphi `TColor` format: named constants (`clRed`, `clMoneyGreen`, ...), `$00BBGGRR` hex (BGR, not RGB) or a decimal integer. The backend returns them **raw**; the conversion happens **only here**:

- Convert with `normalizeToHexColor` from `src/utils/color-utils` (returns `#RRGGBB` or `null` for missing/OS-dependent system colors) and pick the text color with `getReadableTextColor`. Do not write another converter, and do not ask the backend to convert.
- For status chips use `src/components/DataDisplay/DelphiColorChip`, which falls back to a neutral outlined chip when the color can't be converted.
- Known sources: customer status (`stato_clienti.Id_stato`: the **status id itself is the color**, see `CustomerStatusChip`), product status (`productStatus.color` from the `status` include of `product/new`). Campaign and subscription colors use the same utils.

### Delphi RTF Text

Several long-text fields are stored as RTF by the Delphi app (quote bodies/items, product extended description and notes). The backend returns them raw.

- Decode/encode only with `decodeRtf` / `encodeRtfText` from `src/utils/rtf-utils`. Do not inline another RTF parser.
- The web edits them as plain text: re-encode and send the field **only when the user changed it** (dirty), because re-encoding drops the original Delphi formatting.

### API Errors

- Backend business validations (`AriesException`) arrive as HTTP 400 `{ message }`. Show them with `getApiErrorMessage(error, fallback)` from `src/utils/api-error-utils` instead of a generic error toast.

## Forms And Mutations

- Prefer React Hook Form for non-trivial forms.
- Prefer Zod for request validation/parsing when the form has real rules.
- Keep mutation logic close to the proxy hook layer, not inline in large UI components.
- For modal-based create/update flows, keep the modal UI small and move API wiring into hooks/helpers where possible.
- If a create modal is backed by an API that performs upsert-like behavior, never default identity fields in a way that can silently overwrite the latest record.
  Example: for "create next subscription" flows, derive the suggested year from the latest existing subscription instead of reusing the same year by default.
- Template initialization helpers should support partial form data.
  Do not require unrelated fields just to prefill months, prices, or flags from a previous record.
- When a modal merges campaign data with accepted-proposal data, treat the campaign as the primary business card.
  Show proposal-derived values and initialization actions only when the campaign status actually allows them.
  If proposal data belongs to a specific campaign mail, filter by that campaign mail id instead of loading unrelated proposal history for the same system.

## Naming And File Organization

- Keep file and component names in English.
- Use one main component per file where practical.
- Put route-specific helper components under the local `views/.../components` folder.
- Put generic reusable components under `src/components`.
- Keep types in `src/types`, not mixed into view files unless they are strictly local.
- Prefer English API-facing field names in `src/types/aries-proxy`, even when on-screen labels remain Italian.
  Example: use `reportGroupCount`, `invoiceCount`, and `jobCount`.

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

## Notes For Customer Search/Detail Work

- The customer list (`src/views/customers/list`) now uses server-side search/pagination via `GET customer/search` (`useCustomersSearch`, `useInfiniteQuery`), mirroring the quotes list pattern in `src/views/quotes/list`. Do not reintroduce client-side `.filter()` over a fully-fetched customer array.
- List rows have no "Dettaglio" button: `CustomerTableRow` navigates on click, and opens a new tab on Cmd/Ctrl+click or middle-click (a `<tr>` can't be an `<a>`). The company name is also a real `RouterLink` (with `stopPropagation`) so right-click → "open in new tab" works. Reuse this pattern for other lists that should behave like links.
- The status chip reads the backend-included `customerStatus` (`includes=status`, JSON `customer_status`) — `CustomerStatusChip` is purely presentational and no longer fetches the status list itself. Pass `status` from the include; `statusId` is only a fallback label. The chip color is the status id converted as a Delphi color (see "Delphi Colors" above), not a keyword match on the name.
- Customer create (`RouteConfig.CustomerNew`, `customers/new`, `src/views/customers/new/CustomerNewView.tsx`) and edit (`CustomerDetailView`) share the same form: `src/views/customers/form/CustomerFormFields.tsx` (`mode: 'create' | 'edit'`), `customerFormValues.ts` and the shared `src/components/Layout/FormSaveBar.tsx`. Change fields there, not in the views. In `create` mode Comune/Frazione of the main destination are editable (comune autocomplete is required), the read-only commercial ids and the contacts/destinations tables are hidden, and the dirty highlight is off. After `POST customer` the view navigates to the detail with `replace: true`. Status `ATTIVO` and customer type 1 are preselected, as the Delphi client does.
- `customer/status` and `customer/type` are two distinct lookup endpoints (`useCustomerStatuses`, `useCustomerTypes`) backing the two list filters. **`statusId` is a string** (backend `Stato_cliente` is a short varchar code, not numeric), while `customerTypeId` is numeric. Don't assume both are numbers.
- `GET customer` (no params, full unfiltered list) and `GET customer/mobile-sync` still exist unchanged for backward compatibility (Android + any other legacy consumer). Do not repurpose them for the searchable list; use `customer/search` instead.
- `RouteConfig.CustomerDetail` (`customers/:customerId`) is wired to `src/views/customers/detail/CustomerDetailView.tsx`. It's a single React Hook Form (`useForm` with `values: defaultValues, resetOptions: { keepDirtyValues: true }`) covering the customer's core fields, main contact, and main destination, with a sticky bottom save bar (shown only when `isDirty`) and changed fields highlighted via `formState.dirtyFields` (light-yellow `#fff9c4` background). On submit it fires up to 3 independent PATCH mutations (`useUpdateCustomer`, `useUpdateCustomerMainContact`, `useUpdateCustomerMainDestination`), each only if its own section has dirty fields.
- On the **edit** modals/forms, Comune, Frazione, Figura, and CAP are still read-only (disabled `TextField`s) — those are FK ids the backend only resolves to display strings on read, and `CustomerDestinationUpdateModel`/`CustomerContactUpdateModel` still don't accept them. They're only settable once, at **creation** time (see below). Don't make them editable on existing rows without backend support for that first, or a save would corrupt the underlying id.
- Every row in the destinations/contacts tables (including the main one) now has an `EditIcon` `IconButton` opening `CustomerDestinationEditModal`/`CustomerContactEditModal` (`src/views/customers/components`, via `useModal().showModal`), backed by `useUpdateCustomerDestination`/`useUpdateCustomerContact`. The main row additionally keeps its "Principale" chip and is still also editable inline through the top sticky-save form (two edit paths for the same row, by design, per explicit request) — don't remove either without checking first.
- Non-main rows additionally get a `MoreVertIcon` menu with a single "Elimina" item, which opens `ConfirmationModal` (`src/components/Modals/ConfirmationModal`) before calling `useDeleteCustomerDestination`/`useDeleteCustomerContact` (`DELETE customer/{id}/destination/{destinationId}` / `.../contact/{contactId}`). This logic lives in `CustomerDestinationRowActions`/`CustomerContactRowActions` — the main row never renders the menu at all (backend also refuses to delete it, but don't rely on that alone; keep the frontend guard too).
- Each table's `CardHeader` has an "Aggiungi destinazione"/"Aggiungi contatto" action opening `CustomerDestinationCreateModal`/`CustomerContactCreateModal`. The destination modal uses a debounced `Autocomplete` (`useComuneSearch` from `src/proxies/aries-proxy/geo.ts`, enabled only once the query is 2+ chars, since `comune` has ~8000 rows) and a dependent Frazione `TextField select` (`useFrazioniByComune`, only rendered once a comune is picked and has frazioni); the contact modal uses a plain `TextField select` backed by `useCustomerContactFigures` (small bounded list, fetched whole). Follow the same shape for any similar FK-backed create field — full list only when the lookup is genuinely small, autocomplete-search when it isn't.
- Saving the detail with changed billing data (company name, company name 2, VAT, tax code) asks the same two questions as Delphi (`UFCustomers.BtnEditClick`): "yes" sends `markAsVaried: true` on `PATCH customer/{id}`, the backend copies the customer (`sp_ariesCustomerMarkAsVaried`), applies the changes to the copy and sets the original to VARIATO; the response contains the **new** customer, so the main contact/destination PATCHes go to that id and the view navigates there. Folder/PDF renames (customer, systems, report PDFs) happen server-side on every save — never try to do them from the frontend.
- The `Customer` type in `src/types/aries-proxy/customers.ts` only covers the fields the backend `CustomerModel` exposes; the legacy Delphi desktop form has many more (bank accounts, notes, sales, tags, highway/ZTL avoidance, extra destination fields). Extend the backend first if a future edit form needs parity with it.

## Notes For Subscription Work

There is already a placeholder modal at:

- `src/components/Modals/CreateSystemSubscriptionModal/index.tsx`

When extending system subscription flows:

- keep API integration aligned with the `proxies` pattern
- prefer dedicated typed models in `src/types/aries-proxy/systems.ts` or `shared.ts` as appropriate
- keep modal UX thin and avoid burying domain logic in the JSX file
- distinguish clearly between current campaign context and latest accepted proposal data
- if the UI shows a single "latest subscription campaign" summary, merge secondary data into that card instead of rendering separate cards with overlapping labels
- if the modal offers "initialize from previous data", keep the initialization logic in small helpers and validate that the chosen year still represents a new record
- if the page supports deep links that auto-open the modal, drive them from query string parameters, resolve the target mail explicitly, and clear the trigger params immediately after opening

## Notes For Product Search/Detail Work

- Product endpoints: list/count use `product/new` and `product/new/metadata` (because `GET product` is still the full-list sync of old Android versions); the detail uses `GET product/{code}?includes=...` and saves with `PUT product/{code}` (the Android app shares the GET without includes and keeps its own `PATCH`). Do not call the legacy `product/search` from the web.
- Product codes are free text (e.g. `1303131**`): build detail links with `buildProductDetailLink` (`src/views/products/productHelpers.ts`), which URL-encodes the code; API calls encode it too.
- The detail page (`src/views/products/detail`) mirrors the customer one: one React Hook Form, sticky `FormSaveBar`, dirty fields highlighted. Save is `PUT product/{code}` with the **full editable state** (`toProductSaveRequest`), so nullable FKs (brand, supplier, subcategories, color) can be cleared. `extendedDescription` is sent only when dirty (RTF, see above).
- Before saving, a changed barcode / supplier code already used by another product asks for confirmation (exact-match search with `barcode` / `supplierProductCode`), like the Delphi client. Hard validations (category required, multiplier != 0, production cost type when `ENABLE_PRODUCT_REQUIRED_PRODUCTION_COST_TYPE` is on, subcategory consistency) are enforced by the backend and shown via `getApiErrorMessage`.
- Detail tables (codes, spare parts / equipment / operations, notes, regulations) are editable through modals in `src/views/products/detail/components` with `ProductDetailRowActions` (edit + confirmed delete); every mutation invalidates all `ProductsQueryKeys.all` queries. Notes are RTF: re-encode only when the text changed. Prices stay read-only.
- New product: `products/new` (`ProductNewView`) reuses `ProductFormFields` without `product` (code editable, empty = automatic code). Duplicate / delete / label are in `ProductDetailActions`; the label opens the JPEG in a new tab. The picture card (`ProductPictureCard`) uploads with `FormData`.
- Binary endpoints (picture, label) are requested with `responseType: 'arraybuffer'`, because the client response interceptor would mangle a Blob; `FormData` bodies are skipped by the request interceptor's camelCase -> snake_case mapping. Query params are never mapped: pass snake_case keys when the backend expects them (e.g. `label_width`).
- Code change: "Cambia codice" in `ProductDetailActions` (`ProductRenameModal`, `POST product/{code}/rename`), then the page navigates (replace) to the new code. The backend also moves documents folder and picture.
- Kits: "Articolo composto" can only be ticked when creating. On kit products `ProductKitCard` edits the composition locally (add via product autocomplete with the component's internal cost/price/installation time, edit qty/cost/price/t.inst, reorder, remove) and saves it as a whole (`PUT product/{code}/kit-components`): the backend recalculates kit price, cost and installation time. The card is inside the product `<form>`, so it swallows Enter.
- Prices: the Listino card edits a row or adds a supplier/brand price list with `ProductPriceModal` (`PUT product/{code}/prices`; brand lists only have a price).
- Catalogue-wide actions live in `ProductTabs`: "Stampa listino" (asks whether to exclude obsolete products, opens the PDF of `product/price-list/print`) and "Ricarico prezzi" (`products/price-charge`, `ProductPriceChargeView`: cost bands + options + zero-cost anomalies, double confirmation).
- The "Listino" `%` column is computed client-side by `getPriceListEntryMargin`: the internal row follows the Ricarico/Sconto toggle, supplier rows always use the discount formula, brand rows have no cost.
