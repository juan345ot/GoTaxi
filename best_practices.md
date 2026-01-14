# 📘 Project Best Practices

## 1. Project Purpose
GoTaxi is a multi-application platform for ride-hailing operations. It comprises:
- A backend service handling authentication, trip lifecycle, payments, metrics, and real-time tracking.
- An Admin Web app for operations staff to manage drivers, passengers, rates, and complaints.
- Passenger and Driver mobile apps built with React Native for requesting and fulfilling trips.

Key domains include Users, Drivers, Passengers, Trips, Payments, Ratings, Config, and Metrics. Real-time tracking is supported via sockets. Security includes JWT with rotation/refresh, rate limiting, sanitization, and role-based access.

## 2. Project Structure
Monorepo with multiple apps and shared operational assets:
- docs/: Architecture, API, Coding Standards, Environment Setup, Postman collection.
- scripts/: Environment setup scripts (PowerShell and Bash).
- docker-compose*.yml: Multi-service orchestration for local/prod.

Applications:
- go-taxi-backend/
  - src/
    - api/: controllers, routes, dtos (web/API layer)
    - business/: domain/business services (core rules)
    - config/: env, security, performance, constants, roles
    - domain/: entities (domain models abstractions)
    - middlewares/: Express middlewares (auth, cache, security, errorHandler, etc.)
    - models/: persistence models (likely Mongoose schemas)
    - repositories/: repository layer (DB access abstraction)
    - services/: cross-cutting services (cache, jwt rotation, mail, payments, metrics, notifications)
    - sockets/: socket helpers and tracking socket handlers
    - utils/: helpers, pagination, date, logging
    - app.js: Express app composition and wiring
  - tester/: Jest setup, tests, mocks, factories, global setup/teardown

- go-taxi-admin-web/ (React + Vite + Tailwind)
  - src/
    - api/: axios instance and API modules (auth, drivers, passengers, rates, metrics, complaints)
    - components/: feature components (Auth, Drivers, Passengers, Rates, Dashboard, Complaints, Layout, ui)
    - contexts/: React context for auth/session
    - hooks/: reusable hooks (e.g., useAuth)
    - pages/: top-level screens (AdminPanel, Login)
    - router.jsx: route definitions
    - App.jsx, main.jsx, index.css
  - .env.example, ESLint/Prettier configs, Vite/Tailwind configs, Dockerfile, nginx.conf

- GoTaxiPassengerApp/ (React Native)
  - src/: domain, infrastructure, api, components, contexts, hooks, navigation, screens, services, styles, translations, utils, __tests__
  - jest.config.js, eslint/prettier configs, tsconfig.json, app.json

- GoTaxiDriverApp/ (React Native)
  - src/: api, components, config, contexts, hooks, navigation, screens, services, translations, utils
  - eslint config, tsconfig.json, app.json

General conventions:
- Clear separation between presentation, domain/business, and infrastructure layers.
- API integration is centralized (axios instance and API modules on web/mobile; repositories and services on backend).
- Environment-based configuration via config/env files and .env.example templates.

## 3. Test Strategy
Frameworks:
- Backend: Jest (unit and integration) with global setup/teardown and dedicated integration config.
- Passenger App: Jest for React Native (tests in src/__tests__).
- Admin Web and Driver App: No explicit configs found; recommended to adopt testing-library + Jest or Vitest for consistency.

Organization:
- Backend tests under go-taxi-backend/tester/ with:
  - __mocks__/ for module and network mocks
  - factories/ for building test data
  - tests/ for unit/integration test files
  - config/ and jest.*.config.js for environment and integration setup
- Passenger App tests under GoTaxiPassengerApp/src/__tests__/.

Guidelines:
- Prefer unit tests for services, repositories, utils, and pure components.
- Use integration tests for API routes, middlewares, sockets, and cross-layer flows (e.g., Trip lifecycle, Auth).
- Mock external I/O (network, DB, file, payment gateways) using __mocks__ and factories.
- For HTTP, use request-level tests against an in-memory or test DB; isolate with global setup/teardown.
- For sockets, test event contracts and payload shapes; avoid flakiness with timeouts and async utilities.
- React/React Native: use @testing-library/*; assert on behavior and accessible roles/testIDs, not implementation details.
- Keep tests deterministic and independent; avoid shared mutable state.
- Target meaningful coverage; focus on critical paths: auth, payments, trip state, rate limiting, error handling.

Naming:
- Test files: <name>.test.js|ts or <name>.spec.js|ts next to units or within tests/ folders.
- Mocks/factories named after the entity/module they mimic.

## 4. Code Style
Languages: JavaScript/TypeScript across Node, React, React Native.

Formatting & linting:
- Use the repository ESLint and Prettier configs present in each app.
- Run and fix linters before commit; keep imports sorted and remove dead code.

Naming:
- Variables/functions: camelCase
- Classes/React components: PascalCase
- Files: Components as PascalCase files; hooks prefixed with use*; backend modules kebab-case or camelCase consistently per folder.
- Constants: UPPER_SNAKE_CASE.

Typing:
- Prefer TypeScript where available (mobile apps configured with tsconfig). For JS code, add JSDoc types on public APIs and complex data.

Async and side effects:
- Use async/await with try/catch. Avoid unhandled promises.
- Never block the event loop with CPU-heavy work; offload to background jobs/services if needed.

React/React Native:
- Components as pure as possible; extract logic into hooks.
- Use Context for auth/session; keep provider boundaries minimal.
- Co-locate component-specific styles and tests.
- Use React Query or custom hooks for data fetching patterns; centralize API calls through api modules/axiosInstance.

Backend (Express):
- Controllers: thin; delegate to business services.
- Services: encapsulate domain logic; stateless if possible.
- Repositories: only DB access; no business logic.
- Middlewares: composable cross-cutting concerns.
- Use next(err) and centralized errorHandler middleware.

Errors & logging:
- Throw domain-specific errors with messages safe for clients; map to HTTP codes in errorHandler.
- Log with utils/logger.js; include correlation IDs when available.
- Never leak secrets or stack traces to clients.

Security:
- Use middlewares: auth, sanitize, rateLimit, cors, security headers.
- JWT rotation and refresh via dedicated services and middleware.
- Validate all inputs (dtos/validation middleware) and sanitize outputs.

## 5. Common Patterns
- Service–Repository pattern on backend; DTOs for request/response shaping.
- Middleware pipeline for cross-cutting concerns (auth, caching, rate limiting, security, error handling, uploads).
- Centralized configuration (config/env.js, constants.js, roles.js, security.js).
- Socket event handlers separated into sockets/ with helper utilities.
- API composition on web/mobile via axios instance and domain-specific API modules.
- Utilities for pagination/date/logging; prefer reusing utils across modules.
- Separation of domain vs infrastructure in Passenger App (domain/, infrastructure/).
- Barrel files (e.g., api/index.js) to organize exports where appropriate.

## 6. Do's and Don'ts
✅ Do
- Follow the existing layering: controllers → services → repositories.
- Keep controllers small; put logic in services and reuse utilities.
- Use validation and sanitization for every external input.
- Add tests for critical business rules and regressions.
- Use axiosInstance and API modules instead of ad-hoc fetches.
- Keep environment-specific values in .env; document in .env.example.
- Use middlewares for cross-cutting concerns; don’t duplicate logic.
- Use the logger utility; include context (userId, tripId) in logs.
- Ensure socket event names and payloads are versioned or documented in docs/.
- Write idempotent operations for payments and external webhooks.

❌ Don’t
- Access the DB directly from controllers or services; go through repositories.
- Hardcode secrets, URLs, or credentials; never commit real .env files.
- Swallow errors or return raw stack traces to clients.
- Bypass axiosInstance or create one-off clients without interceptors.
- Mix UI and data-fetching logic inside React components; use hooks.
- Introduce circular dependencies between layers.
- Rely on global mutable state in tests; prefer factories and setup helpers.

## 7. Tools & Dependencies
Key libraries and services (by area):
- Backend: Express, middlewares (auth, rate-limit, sanitize, compression), sockets (socket.io), payments (MercadoPago), cache and metrics services, Mongoose-like models under models/.
- Admin Web: React, Vite, TailwindCSS, axios with centralized instance, React Router, Dockerized Nginx.
- Mobile: React Native (Expo configuration via app.json), ESLint/Prettier, Jest for Passenger App.
- Testing: Jest with dedicated integration config on backend; mocks/factories; RN testing library recommended on mobile.
- Tooling: ESLint, Prettier, Docker Compose, setup scripts (scripts/setup.sh, scripts/setup.ps1).

Setup (high level):
- Copy .env.example to .env in each app and fill required values.
- Use scripts/setup.* to bootstrap local dependencies if provided.
- For containerized runs, use docker-compose.yml; for production, docker-compose.prod.yml.
- Consult docs/ENVIRONMENT_SETUP.md and per-app README.md files for exact commands.

## 8. Other Notes
- Maintain consistency with docs/ (API.md, ARCHITECTURE.md, CODING_STANDARDS.md). Update them when interfaces change.
- Prefer small, focused PRs aligned with these patterns; include test updates and documentation when relevant.
- When adding new backend features:
  - Define DTOs and validation first.
  - Add service methods and repository queries.
  - Expose via controller/routes and document in docs/API.md.
  - Add unit and integration tests under tester/.
- When adding new web/mobile features:
  - Add API methods in src/api/* and consume via hooks/contexts.
  - Keep components presentational; lift side effects to hooks.
  - Internationalize user-facing strings using translations/.
- For sockets:
  - Keep event contracts in sockets/socketHelpers.js updated.
  - Handle disconnects, reconnections, and auth token refresh.
- For uploads:
  - Use middlewares/upload.js; validate file types and sizes; store following uploads/ guidelines.
- For payments:
  - Use services/mercadoPagoService.js; handle webhooks idempotently and verify signatures.
- For metrics and performance:
  - Use config/performance.js and middlewares/performance.js; instrument critical paths.
- For pagination:
  - Use utils/pagination.js; never return unbounded lists from APIs.
