# FlowAPI frontend integration status

The frontend API client now covers every route documented in the backend `API_DOCUMENTATION.md`. All calls are made through authenticated Next.js server actions, so the JWT remains in an HTTP-only cookie and is never exposed to browser JavaScript.

## Integrated endpoint groups

| Group | Integrated behavior |
|---|---|
| System | Health status and workspace-scoped global search |
| Users | Register, login, refresh, logout, session/profile lookup, username update, and password change |
| Workspaces | List, create, get, rename, and delete; parallel loading of child resources |
| Flows | Create, get, persist graph updates, delete, list requests, and execute |
| Requests | Create, get, update, delete, execute, duplicate, and bulk delete |
| Environments | Create, get, persist variable updates, and delete |
| Collections | Create, get, update, delete, associate requests, and remove requests |
| History | Paginated workspace history, history detail, and clear history |
| Local collections | Export, list, inspect, import, and delete the backend-local Bruno copy |

The action layer in `app/actions/flow-api.ts` exposes all documented routes. The UI now includes server-side execution for saved requests, real flow execution and deletion, persistent history with a detail inspector and clear action, global search, profile/password controls, automatic session refresh, environment editing/deletion, collection create/rename/delete, request duplicate/delete/bulk-delete, workspace create/rename/delete, and Bruno export/import/local-copy deletion controls.

## Intentional ad-hoc request fallback

A brand-new unsaved tab has no backend request ID, while `POST /requests/:id/execute` requires one. Those scratch requests continue to use the bounded Next.js proxy. Once saved, the request is updated and executed by the Go backend, including environment substitution and persistent history.

## Backend capabilities still unavailable

These are product/backend gaps listed by the backend documentation, not missing frontend integrations:

- OAuth/account linking and server-side JWT revocation.
- Workspace members, invitations, roles, presence, and activity.
- Nested collection folders and manual folder ordering.
- Encrypted secrets and multi-scope variable precedence.
- Persisted flow-run summaries, scripts/tests, monitors, schedules, and performance tests.
- General list pagination/filter/sort metadata beyond history and search limits.
- OpenAPI, Postman, and cURL import/export or code generation.
- Organization-specific outbound allowlists and extended audit policy.

Do not integrate against routes not listed in `API_DOCUMENTATION.md`.
