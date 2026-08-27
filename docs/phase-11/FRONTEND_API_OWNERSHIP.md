# Phase 11 – Frontend API ownership

This inventory is the cutover record for the existing React UI. It maps only
contracts that were verified in the Auth, User, Event, Ticket, Order, Payment,
and Notification OpenAPI documents and the Gateway route configuration. No
Marketplace, Chat, or AI client is introduced.

## Boundary

- `src/lib/axios.js` is the only Axios package import and the only Axios
  instance. Its base URL is `VITE_API_URL` with one `/api/v1` prefix.
- Pages, components, stores, and contexts call domain services. Domain
  services call the canonical client.
- `ROUTE_*` names below are the Gateway flags. Docker defaults are called out
  where they differ from the Gateway application default.
- Error behavior remains the existing UI fallback/toast behavior, with the
  canonical client also exposing `status`, `code`, `message`, `correlationId`,
  and `details`.

## Ownership matrix

| UI/page/flow | Field or action | Old endpoint | Owner service | Gateway endpoint | Route flag | Response mapping | Error behavior | Automated/manual test | Cutover or blocker |
|---|---|---|---|---|---|---|---|---|---|
| Login/register/OTP/reset | Authentication and session | Auth calls from `AuthContext` and auth modals | Auth | `/api/v1/auth/login`, `/register`, `/refresh`, `/logout`, `/verify-otp`, `/resend-otp`, `/forgot-password`, `/verify-reset-otp`, `/reset-password` | `ROUTE_AUTH_SERVICE_ENABLED` | Auth response tokens/user are stored by context; refresh is handled by Axios interceptor | Existing auth error messages; failed refresh clears session and redirects to `/login` | `test:phase11`; runtime login/refresh/logout | Cut over |
| Profile modal/context | Profile fields | Direct profile call | User | `/api/v1/users/profile` (PUT) | `ROUTE_USER_SERVICE_ENABLED` | Updated `UserResponse` is passed to auth context | Existing save error toast | `test:phase11`; runtime profile | Cut over |
| Feedback/support admin | Feedback list and admin action | Direct admin feedback call | User | `/api/v1/admin/feedback`; `/api/v1/admin/feedback/action` | `ROUTE_USER_FEEDBACK_ENABLED` | `FeedbackPage` consumes the page payload; actions keep the current refresh callback | Existing page error state/toast | `test:phase11`; runtime admin feedback | Cut over |
| Support page | Submit attendee/organizer support ticket | Local fake timeout (no backend endpoint) | None approved | None in frozen User OpenAPI | N/A | No response mapping | Must show a blocker; must not report a created ticket | Manual blocker verification | Blocked: contract has no ticket-create endpoint |
| Events discovery/detail | List, detail, schedule, timeline, venue/template | Direct event calls | Event | `/api/v1/events`, `/api/v1/events/{eventId}`, schedules/timelines/venues/templates routes | `ROUTE_EVENT_SERVICE_ENABLED` | Existing event service adapters preserve page models | Existing empty/error states | Runtime attendee discovery/detail | Cut over |
| Organizer event management | Create/update/publish/delete and schedules/timelines/invitations | Direct event calls | Event | `/api/v1/organizer/events...` and invitation routes | `ROUTE_EVENT_SERVICE_ENABLED` | Existing request bodies and event adapters retained | Existing action toast/error behavior | Runtime organizer event actions | Cut over |
| Admin events | List, approve, suspend, bulk actions | Direct admin event calls | Event | `/api/v1/admin/events`, `/approve`, `/suspend`, `/bulk-approve`, `/bulk-suspend` | `ROUTE_EVENT_SERVICE_ENABLED` | `EventResponse`/list is mapped to the existing table row shape | Existing table action errors | `test:phase11`; runtime admin event actions | Cut over |
| Registration/order | Registration, attendee registrations, organizer registrations | Direct registration calls | Order | `/api/v1/registrations`, `/api/v1/attendee/registrations`, `/api/v1/organizer/events/{eventId}/registrations` | `ROUTE_ORDER_REGISTRATIONS_ENABLED`, `ROUTE_ORDER_ATTENDEE_REGISTRATIONS_ENABLED`, `ROUTE_ORDER_ORGANIZER_REGISTRATIONS_ENABLED` | Existing registration adapters retained | Existing checkout/list error behavior | Runtime attendee registration and organizer list | Cut over |
| Ticket types | Ticket type CRUD | Direct ticket-type calls | Ticket | `/api/v1/organizer/events/{eventId}/ticket-types` | `ROUTE_TICKET_TYPES_ENABLED` | Existing ticket type model | Existing form/toast errors | Runtime organizer ticket types | Cut over |
| Ticket/check-in/static QR | Ticket list, QR, check-in | Direct ticket calls | Ticket | Ticket attendee routes and `/api/v1/organizer/events/{eventId}/check-in` | `ROUTE_TICKET_CHECKIN_ENABLED` | Existing QR/ticket response adapters retained | Existing ticket/QR error states | Runtime attendee ticket/static QR and organizer check-in | Cut over |
| Organizer dashboard | Finance/revenue cards and event list | `/organizer/dashboard/overview`, `/attendees`, `/checkin-density`, `/events` (legacy aggregate calls) | Payment + Event | `/api/v1/organizer/dashboard/finance`, `/api/v1/organizer/dashboard/revenue`, `/api/v1/organizer/events` | `ROUTE_PAYMENT_FINANCE_ENABLED`, `ROUTE_EVENT_SERVICE_ENABLED` | FE composes the existing cards from owner responses; no Gateway aggregation | Partial owner failure keeps existing page fallback | `test:phase11`; runtime organizer dashboard | Cut over with reduced fields where owner data is absent |
| Organizer analytics | KPI finance/events | Legacy analytics aggregate | Payment + Event | `/api/v1/organizer/dashboard/finance`, `/api/v1/organizer/events` | Payment/Event flags above | FE composes KPI rows; event list remains event-owned | Existing loading/error behavior | `test:phase11`; runtime analytics | Cut over |
| Organizer analytics | Per-event metrics | Legacy dashboard metrics | Event + Ticket + Order | `/api/v1/organizer/events/{eventId}/metrics`, `/ticket-metrics`, `/order-metrics` | `ROUTE_EVENT_SERVICE_ENABLED`, `ROUTE_TICKET_METRICS_ENABLED`, `ROUTE_ORDER_METRICS_ENABLED` | Owner metric payloads are separate; FE may compose by event | Partial-data state required | Contract/static mapping; runtime when event data exists | Available contract; unsupported aggregate charts remain blocked |
| Organizer analytics | Density, audience, conversion funnel | Legacy dashboard aggregate routes | None approved | None in frozen OpenAPI | N/A | No fabricated response or frontend “fetch all then filter” | Preserve empty state and document blocker | Manual UI verification | Blocked: no owner contract |
| Organizer financial page | Transactions, withdrawals, finance overview | Direct finance calls | Payment | `/api/v1/organizer/finance/overview`, `/transactions`, `/withdrawals` | `ROUTE_PAYMENT_FINANCE_ENABLED` | Existing finance adapters retained | Existing page errors/toasts | Runtime organizer finance | Cut over when flag enabled |
| Organizer financial export | Financial report export | `/organizer/reports/export` legacy | Payment | `/api/v1/organizer/reports/financial` | `ROUTE_PAYMENT_FINANCE_ENABLED` | Blob download remains owner response | Existing download/error behavior | `test:phase11`; runtime export | Cut over |
| Admin dashboard | Revenue/finance | `/api/v1/admin/dashboard`, `/admin/dashboard/export` legacy | Payment + Event | `/api/v1/admin/dashboard/finance`; `/api/v1/admin/finance/export`; `/api/v1/admin/events` | Payment/Event flags | FE composes finance and event counts/revenue; satisfaction has no verified owner | Partial data fallback; no legacy retry | `test:phase11`; runtime admin dashboard | Cut over; satisfaction is a documented blocker |
| Admin reports | Financial/report cards and export | Existing page is static/mock; no verified live endpoint call | Payment for financial export; other fields have no owner | `/api/v1/admin/finance/export` and Payment admin finance endpoints | `ROUTE_PAYMENT_FINANCE_ENABLED` | No fake live mapping is claimed | Export/action must surface blocker if unsupported | Manual review | Blocked for non-financial mock fields; no legacy fallback |
| Admin finance | Finance overview, transactions, withdrawals | Existing page is static/mock | Payment | `/api/v1/admin/finance/overview`, `/transactions`, `/withdrawals`, `/process-withdrawal`, `/export` | `ROUTE_PAYMENT_FINANCE_ENABLED` | Contract models are available; page is not silently treated as live | Existing mock view is not reported as backend success | Manual review | Blocked until page ownership wiring is explicitly approved |
| Admin settings – finance | Currency, commission, plan, Stripe active flag | `/api/v1/admin/settings` legacy | Payment | `/api/v1/admin/settings/payment` (GET/POST) | `ROUTE_PAYMENT_FINANCE_ENABLED` | Map keys: `finance.currency`, `finance.commissionRate`, `finance.subscriptionPlan`, `api.stripeActive` | Existing save/load toast; normalized API error | `test:phase11`; runtime admin settings | Cut over |
| Admin settings – event | Event settings namespace | `/api/v1/admin/settings` legacy | Event | `/api/v1/admin/settings/event` (GET/POST) | `ROUTE_EVENT_SERVICE_ENABLED` | `List<EventSettingResponse>` with `settingKey`, `settingValue`, `valueType` | Existing load error; unsupported fields are not saved | Static mapping; runtime settings | Endpoint available; current UI exposes no event-owned key to edit |
| Admin settings – security | 2FA and session/password policy | `/api/v1/admin/settings` legacy | Auth | `/api/v1/admin/settings/security` (GET/POST) | `ROUTE_AUTH_SERVICE_ENABLED` | Keys: `security.twoFactorEnabled`, `security.sessionTimeout`, `security.minPasswordLength` | Existing load/save error; no legacy retry | Unit/authorization/contract checks; runtime admin settings | Cut over in code; production backfill/reconciliation pending |
| Admin settings – API | SendGrid active flag | `/api/v1/admin/settings` legacy | Notification | `/api/v1/admin/settings/notification` (GET/POST) | `ROUTE_NOTIFICATION_SERVICE_ENABLED` | Key: `api.sendGridActive`; SMTP secret material is not exposed | Existing load/save error; no legacy retry | Unit/authorization/contract checks; runtime admin settings | Cut over in code; production backfill/reconciliation pending |
| Admin settings – branding | Primary color, font family, logo URL | `/api/v1/admin/settings` legacy | User | `/api/v1/admin/settings/branding` (GET/POST) | `ROUTE_USER_SERVICE_ENABLED` | Keys: `branding.primaryColor`, `branding.fontFamily`, `branding.logoUrl` | Existing load/save error; no legacy retry | Unit/authorization/contract checks; runtime admin settings | Cut over in code; production backfill/reconciliation pending |
| Admin settings – backup | Backup action/status | Local simulation | None approved | None | N/A | No response mapping or fake backup evidence | Blocker toast | Manual blocker verification | Blocked; requires production backup authority/evidence |
| Notifications | List, unread/read-one/read-all | Direct notification calls | Notification | `/api/v1/notifications`, `/api/v1/notifications/{id}/read`, `/api/v1/notifications/read-all` | `ROUTE_NOTIFICATION_SERVICE_ENABLED` | Existing dropdown/page models and refresh callback retained | Existing notification empty/error behavior | `test:phase8`; `test:phase11`; runtime read flows | Cut over |
| Broadcast | Admin list/send | Direct broadcast calls | Notification | `/api/v1/admin/broadcasts` (GET/POST) | `ROUTE_NOTIFICATION_SERVICE_ENABLED` | Existing broadcast page model retained | Existing send/list errors and refresh callback | `test:phase8`; `test:phase11`; runtime broadcast | Cut over |

## Explicitly out of scope

There is no frontend Marketplace, Chat, AI, or Mobile client/UI added by Phase
11. Their skeleton routes remain disabled by default. No business aggregation
is added to the Gateway, and no legacy Dashboard/Report/Settings request is a
fallback path.

## Verification status

The Phase 11 static gates pass: lint, API-boundary verification, Phase 8
notification regression, Phase 11 compatibility smoke, production dependency
audit, backend contract checks, architecture checks, and Compose validation.
The production build and account/data-driven browser smoke must be rerun after
every final code change in an environment that permits the Vite/esbuild child
process.

The contract gaps above are explicit deferred scope, not successful cutovers.
The UI exposes an unsupported-operation state for those actions and does not
fall back to a legacy endpoint, fabricate a response, or claim a successful
write. Organizer financial export is wired to the Payment-owned contract;
unsupported local template and AI report generators are disabled.
