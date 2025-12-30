# StreamPlanner — Static Demo

This folder contains a minimal Next.js + Tailwind static demo of the StreamPlanner UI (based on the Figma package).

## Prerequisites ✅
- Node.js (recommended 18.x or later) and npm
- Optional: Playwright (for automated screenshots)

## Quickstart — run locally
1. Open a terminal and change into the folder:
   cd streamplanner-web
2. Install dependencies:
   npm install
3. Start the dev server:
   npm run dev
4. Open http://localhost:3000 in your browser

## Capture screenshots (automated)
1. Ensure the dev server is running (see above)
2. Install Playwright browsers (only needed once):
   npx playwright install
3. Run the screenshot script:
   npm run screenshots
4. Screenshots will be saved to `scripts/output/`

> Tip: You can set `BASE_URL` env var to point at a different host (e.g., a deployed preview):
> BASE_URL=https://your-preview.example npm run screenshots

## Accessibility & Responsive checklist 🧭
- Images have `alt` text (verify in content)
- Tab navigation works for interactive controls (links, buttons)
- Focus states are visible (outline or visual focus indicator)
- Color contrast meets AA for body text and interactive elements
- Pages render at these widths: 320px (mobile), 768px (tablet), 1280px (desktop)
- Headings are hierarchical (H1/H2/H3 as appropriate)
- Buttons and links have accessible labels

## Tests (visual & accessibility)
We added Playwright-based visual regression and axe accessibility tests.

How to run locally:
1. Install dependencies: `npm install`
2. Install Playwright browsers (only needed once): `npx playwright install`
3. Run the full E2E suite (starts the dev server automatically): `npm run test:e2e`
4. To update snapshots after an intentional visual change: `npm run test:e2e:update`

## Authentication (Supabase)
We use Supabase Auth for user sign-in (magic link). Minimal setup to test locally:

1. Create a Supabase project and copy keys to `streamplanner-web/.env.local` (see `../infra/README.md`). Required keys:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - DATABASE_URL

2. Install server deps (Prisma + Supabase):
   cd streamplanner-web
   npm install

3. Run Prisma migrations to create DB tables:
   npx prisma migrate dev --name init

4. Start the dev server:
   npm run dev

5. Visit the sign-in page:
   http://localhost:3000/auth/signin

6. After signing in via magic link, visit http://localhost:3000/profile and confirm it shows "Last synced".

## Watchlist (feature)
- Endpoints:
  - GET `/api/watchlist` — returns current user's watchlist items (includes `title` object)
  - POST `/api/watchlist` — body: `{ title: { tmdbId, title, poster, genre, year } }` adds the title to the user's watchlist (creates/upserts `Title`)
  - DELETE `/api/watchlist/:tmdbId` — removes the title from the user's watchlist
- Client helper: `lib/watchlistClient.js` exposes `fetchWatchlist`, `addToWatchlist`, `removeFromWatchlist` for authenticated calls
- UI: `pages/recommendations.js` now fetches a user's watchlist and shows Add/Added toggle on cards
- UI: `pages/watchlist.js` (new) shows the signed-in user's watchlist and supports removing items
- Tests:
  - `tests/watchlist.spec.js` verifies add/remove behavior and DB persistence at the API level
  - `tests/watchlist-ui.spec.js` verifies the end-to-end UI flow: sign in (test user), add item via API, visit `/watchlist`, verify visibility, remove via UI, verify empty state

How to run watchlist tests locally:
1. Ensure env vars are set in `streamplanner-web/.env.local` (see above)
2. Install dependencies & Playwright browsers:
   npm install
   npx playwright install
3. Run the watchlist tests:
   npm run test:watchlist
   npm run test:watchlist -- --headed (optional) to see the browser in action
Accessibility test for Watchlist page:
- A dedicated axe accessibility test is included: `tests/watchlist-a11y.spec.js`.
- It signs in a test user, ensures the watchlist has an item, navigates to `/watchlist`, runs axe, and asserts there are **no critical or serious violations**.
- Test results are written to `scripts/output/watchlist-axe.json` for debugging and are uploaded as CI artifacts by the existing workflow.

Title detail page:
- Page: `/title/[id]` — displays a title from `data/mapping.json`, shows watchlist status, and allows toggling Add/Remove.
- The Add/Remove button requires authentication; unauthenticated users are redirected to `/auth/signin` when attempting to add.
- UI test: `tests/title-ui.spec.js` signs in a test user, visits `/title/1`, toggles watchlist and asserts DB state.
- Run the title test locally:
  - npm run test:title-ui


Notes:
- Tests use the `webServer` option to start the local dev server on port 3000 before running tests.
- If you'd like to point tests at a deployed preview, set `BASE_URL` env var (e.g. `BASE_URL=https://preview.example.com npx playwright test`).

## PR-style checklist for visual & accessibility changes ✅
- [ ] Add or update Playwright visual snapshot tests for any changed pages/components
- [ ] Run `npm run test:e2e` and confirm no regression snapshots fail
- [ ] If visuals changed intentionally, run `npm run test:e2e:update` and commit updated snapshots
- [ ] Run `npm run test:e2e` and confirm `a11y` tests pass (or fix the reported violations)
- [ ] Ensure accessibility violations are commented and resolved, or add a brief acceptance note in PR

## Known environment note ⚠️
I attempted to start the dev server in this environment but `npm` is not available here, so I couldn't run the server or the tests. Use the steps above on your machine (or CI) and the test suite will run and create/update snapshots as needed.

## Next steps (optional)
- Wire prototype mapping (`prototype-mapping.json`) to add hotspot overlays and simulate flows
- Add CI workflow to run `npm run test:e2e` on PRs (recommended)
- Add axe-based reporting or integrate with PR comment bots for accessibility feedback

## CI (GitHub Actions)
A workflow has been added to automatically run the Playwright E2E visual and accessibility tests on pull requests.
- Location: `.github/workflows/playwright-e2e.yml`
- Runs on `pull_request` against `main`/`master` branches
- Uses Node LTS, caches npm dependencies, installs Playwright browsers, and fails the run on visual or a11y regressions
- Artifacts (Playwright report and snapshots/screenshots) are uploaded for debugging

Consider enabling this in your repo and adding branch protection rules that require `Playwright E2E & A11y Tests` to pass on PRs.
