# Insure Your Paws — Playwright E2E Automation

End-to-end test suite for the [Insure Your Paws](https://staging.insureyourpaws.co.uk/) insurance journey (staging).

## Prerequisites

- Node.js 20+
- npm
- Staging HTTP basic auth credentials

## Setup

```bash
npm ci
npx playwright install chromium
cp .env.example .env
```

Edit `.env`:

```env
HTTP_USERNAME=your_staging_username
HTTP_PASSWORD=your_staging_password
```

## Running tests

| Command | Description |
|---------|-------------|
| `npm test` | Full suite (~100 tests, chromium project) |
| `npm run test:smoke` | Smoke subset (`@smoke` tagged tests) |
| `npm run test:e2e` | Insurance flow spec only |
| `npm run test:petDetails` | Pet details spec |
| `npm run test:quote` | Quote spec |
| `npm run test:summary` | Summary spec |
| `npm run test:payment` | Payment spec |
| `npm run test:validations` | Validations spec |
| `npm run test:headed` | Full suite with visible browser (local) |
| `npm run typecheck` | TypeScript check |
| `npm run report` | Open HTML report |

Run with custom parallelism:

```bash
npx playwright test --workers=1
```

## Project structure

```
├── data/              # Typed test data (petsData.json)
├── fixtures/          # Playwright fixtures (page objects + journey helper)
├── helpers/           # Shared journey navigation (JourneyHelper)
├── pages/             # Page Object Model
├── tests/             # Spec files (numbered by journey stage)
├── types/             # TypeScript interfaces for test data
└── utils/             # Constants, known application defects
```

## CI/CD

GitHub Actions runs:

1. **Smoke** (`@smoke`) on every PR — fast gate
2. **Full suite** after smoke passes

Configure repository secrets:

- `HTTP_USERNAME`
- `HTTP_PASSWORD`

## Reporting

- **HTML:** `playwright-report/` after each run (`npm run report`)
- **Allure:** `npm run test:allure` (generate + open)

## Known failures

| Test | Reason |
|------|--------|
| `1-insurance-flow` test:5 | Application bug — user details cleared after Edit cover → Quote → Summary. Marked `fixme` until fixed in staging. |

## Conventions

- Locators: prefer `data-id` via `getByTestId()` (configured in `playwright.config.ts`)
- Use `fixtures/test` imports instead of `@playwright/test` directly
- Use `JourneyHelper` (`journey` fixture) for repeated multi-step navigation
- Tag critical tests with `@smoke` in the test title for CI smoke runs
