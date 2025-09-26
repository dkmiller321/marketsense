# MarketSense

MarketSense is a lightweight web application built with Next.js, designed to help SaaS founders monitor competitor pricing pages for changes. Users can subscribe by providing their email and a target URL (e.g., a competitor's pricing page). The system periodically fetches the page content, detects changes using content hashing, and sends email notifications if updates are detected. It's currently in beta and free to use, emphasizing simplicity and ease of setup.

## Purpose

The primary goal of MarketSense is to provide automated alerts for pricing or plan changes on competitor websites. This enables SaaS founders to stay informed about market shifts without manual monitoring. Key use cases include:
- Tracking competitor pricing adjustments.
- Detecting new plan tiers or feature updates.
- Receiving timely email notifications with change summaries.

The app is serverless-friendly and uses a simple SQLite database for storing subscriptions, making it ideal for quick deployment on platforms like Vercel.

## Features

- **Subscription Management**: Users subscribe via a simple form on the homepage, storing email and URL in the database.
- **Content Monitoring**: Fetches HTML from subscribed URLs, extracts text content (ignoring scripts and styles), and computes a SHA-256 hash for change detection.
- **Change Detection and Alerting**: Compares hashes; if changed, generates a basic diff and sends an email alert via Postmark with a summary of changes.
- **Manual Trigger**: A development-only button to run checks immediately.
- **Validation and Error Handling**: Input validation with Zod; graceful error handling for fetch failures.
- **Beta Access**: Free during beta; no authentication required.

## Architecture

MarketSense follows a full-stack Next.js architecture with the App Router for both frontend and backend. It uses a monolithic approach for simplicity, with shared libraries for core logic.

### High-Level Components
- **Frontend**: Single-page React component (`src/app/page.tsx`) with a form for subscriptions. Client-side state management with React hooks. Styled with Tailwind CSS.
- **Backend API Routes**:
  - `/api/subscribe/route.ts`: POST endpoint to add new subscriptions (validates and stores in DB).
  - `/api/subscribe/run/route.ts`: POST endpoint to iterate over all subscriptions, perform checks, send alerts if needed, and update hashes.
- **Database**: Local SQLite file (`marketsense.db`) with a single `subscriptions` table (columns: `id`, `email`, `url`, `last_hash`, `created_at`).
- **Shared Libraries** (`src/lib/`):
  - `db.ts`: Initializes SQLite connection and creates the table.
  - `subscriptions.ts`: Functions to add subscriptions, retrieve all, and update hashes.
  - `fetchAndHash.ts`: Fetches URL content with Undici, parses text with Cheerio, computes hashes with Node's `crypto`, and basic diffing.
  - `email.ts`: Sends alerts using Postmark.
- **Data Flow**:
  1. User submits form → POST to `/api/subscribe` → Validate → Insert to DB.
  2. Trigger run (manual or scheduled) → POST to `/api/subscribe/run` → For each subscription:
     - Fetch text → Compute hash.
     - If hash differs from `last_hash`: Diff text → Send email → Update `last_hash`.
     - Log results.

### ASCII Architecture Diagram
```
[User Browser] --> [Next.js Frontend (page.tsx)] --> [API: /subscribe (add)]
                                                             |
                                                             v
[SQLite DB (subscriptions table)] <--> [Lib: subscriptions.ts (CRUD)]
                                                             |
                                                             v
[Trigger Run] --> [API: /subscribe/run] --> [Lib: fetchAndHash.ts (fetch/parse/hash/diff)]
                                                             |                |
                                                             v                v
[Lib: email.ts (Postmark)] <------------------------------- [Update DB hash]
```

### Security Considerations
- Environment variables: `POSTMARK_TOKEN` and `FROM_EMAIL` for email sending.
- No user auth; subscriptions are public but tied to email.
- Fetching external URLs: Uses standard HTTP; consider rate limiting in production.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack for dev/build).
- **Language**: TypeScript 5.
- **UI**: React 19, Tailwind CSS 4.
- **Database**: SQLite with `better-sqlite3`.
- **HTTP Client**: Undici (Node fetch polyfill).
- **HTML Parsing**: Cheerio.
- **Email Service**: Postmark.
- **Validation**: Zod 3.
- **Hashing**: Node.js `crypto` (SHA-256).
- **Linting**: ESLint 9 with Next.js config.
- **Testing**: Playwright 1.55.
- **Other**: PostCSS, TypeScript types for dependencies.

Dependencies are minimal for a lightweight app; see `package.json` for full list.

## Getting Started

### Prerequisites
- Node.js 20+.
- Environment variables: Set `POSTMARK_TOKEN` (from Postmark dashboard) and `FROM_EMAIL` (verified sender email) in `.env.local`.

### Installation
1. Clone or navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   POSTMARK_TOKEN=your_postmark_server_token
   FROM_EMAIL=your-verified-sender@domain.com
   ```

### Running Locally
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. The database (`marketsense.db`) will be created automatically on first run.

### Scripts
- `npm run dev`: Start dev server with Turbopack.
- `npm run build`: Build for production.
- `npm run start`: Run production server.
- `npm run lint`: Lint code.

## Usage

1. **Subscribe to Monitoring**:
   - Visit the homepage.
   - Enter your email and a pricing URL (e.g., `https://competitor.com/pricing`).
   - Click "Start monitoring".
   - You'll see a confirmation message.

2. **Trigger a Check** (Dev Only):
   - Click "Run check now (dev)" on the homepage to manually run the monitoring process.
   - Check console/logs for results; emails will be sent if changes are detected.

In production, schedule runs using Vercel Cron Jobs or a similar service (e.g., every 24 hours).

## Running Checks in Production

The `/api/subscribe/run` endpoint performs all checks. To automate:
- **Vercel Cron**: Add to `vercel.json`:
  ```json
  {
    "crons": [
      {
        "path": "/api/subscribe/run",
        "schedule": "0 9 * * *"
      }
    ]
  }
  ```
- **Alternative**: Use external scheduler (e.g., GitHub Actions, AWS Lambda) to POST to the endpoint.

Note: SQLite works for dev/low-traffic; for scale, migrate to PostgreSQL.

## Deployment

### Vercel (Recommended)
1. Push to GitHub.
2. Connect repo to Vercel dashboard.
3. Add environment variables (`POSTMARK_TOKEN`, `FROM_EMAIL`).
4. Deploy – Next.js handles the rest.
5. Set up cron jobs as above.

### Other Platforms
- Any Node.js host (e.g., Railway, Render).
- Ensure persistent storage for DB or switch to a managed DB.

See Next.js docs for more: [Deployment Guide](https://nextjs.org/docs/app/building-your-application/deploying).

## Development

- **Adding Features**: Extend `subscriptions.ts` for unsubscribe/delete. Improve diffing in `fetchAndHash.ts` (e.g., store full text or use a diff library like `diff`).
- **Testing**:
  - Unit: Add Jest for lib functions.
  - E2E: Use Playwright (`npx playwright test`).
- **Linting/Formatting**: Run `npm run lint`; auto-format with VS Code/Prettier.
- **Environment**: Use `.env.local` for secrets; add to `.gitignore`.

## Limitations & Future Work

- **Current Limitations**:
  - No unsubscribe functionality.
  - Basic diffing (compares to empty/old text; no stored full content).
  - No rate limiting or error retries for fetches.
  - SQLite not ideal for high concurrency; single-file DB.
  - No dashboard for managing subscriptions.
  - Manual/scheduled runs only; no real-time.

- **Potential Improvements**:
  - Add user authentication (e.g., Clerk/NextAuth).
  - Store full page text for better diffs.
  - Implement webhooks or push notifications.
  - Support multiple URLs per user.
  - Analytics for change frequency.
  - Migrate DB to Postgres for scalability.

## Contributing

Contributions welcome! Fork the repo, create a feature branch, and submit a PR. Focus on:
- Bug fixes for fetching/parsing.
- Enhancements to alerting/diffing.
- Tests and docs.

Please adhere to TypeScript and ESLint standards.

## License

MIT License – see [LICENSE](LICENSE) file (add if needed).

---

Built with ❤️ for SaaS founders. Questions? Open an issue.
