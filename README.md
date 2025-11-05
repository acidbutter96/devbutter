This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Admin API route

This project includes a simple administrative API route at `/api/admin` protected with HTTP Basic Auth.

Environment variables (add to your `.env` or environment):

- `ADMIN_EMAIL` — email used for basic auth username

Local email testing with Mailpit
--------------------------------

To test sending emails locally using Mailpit (SMTP + Web UI), you can run the provided Docker compose file:

```bash
docker compose -f docker-compose.mailpit.yml up -d
```

This exposes:
- SMTP on localhost:1025
- Mailpit web UI on http://localhost:8025

Set the following environment variables for the app (for local development you can use a `.env` file):

- SMTP_HOST=localhost
- SMTP_PORT=1025
- SMTP_FROM="DevButter <oi@devbutter.com>"
- (SMTP_USER and SMTP_PASS not required for Mailpit)

When you use the admin "Send reply" action, the app will send the email via the configured SMTP server and you can inspect it in the Mailpit web UI.
- `ADMIN_PASSWORD` — password used for basic auth

If you have a MongoDB connection configured via `MONGODB_URI`, the route will store projects in the `projects` collection. If `MONGODB_URI` is not set, the route falls back to a local JSON file at `data/projects.json`.

Endpoints:

- `GET /api/admin` — lists projects (requires Basic Auth)
- `POST /api/admin` — creates a new project (requires Basic Auth). Body must include at least `{ "title": "Project title" }`.

Example (curl):

```bash
# list projects
curl -u "$ADMIN_EMAIL:$ADMIN_PASSWORD" http://localhost:3000/api/admin

# add a project
curl -u "$ADMIN_EMAIL:$ADMIN_PASSWORD" -X POST -H "Content-Type: application/json" \
	-d '{"title":"My project","description":"Short desc","link":"https://...","repo":"https://github.com/..."}' \
http://localhost:3000/api/admin
```

## Vercel: IMAP check job & environment variables

This project provides a serverless API route `/api/imap-check` that performs a single IMAP check
(connect -> fetch UNSEEN -> append to `formSubmissions` -> close). To run it on Vercel you must
configure environment variables and schedule periodic invocations.

Required environment variables (set in Vercel Project Settings → Environment Variables):

- `MONGODB_URI` — MongoDB connection string used by the API.
- `IMAP_HOST` — IMAP server hostname (e.g. `imap.hostinger.com`).
- `IMAP_PORT` — IMAP port (default `993`).
- `IMAP_USER` — IMAP username (email).
- `IMAP_PASS` — IMAP password.
- `MAILBOX` — optional, mailbox/folder to check (default `INBOX`).
- `IMAP_CHECK_SECRET` — optional shared secret to protect the endpoint. If set, callers must include header `x-imap-secret: <secret>`.

- `IMAP_CHECK_SECRET` — optional shared secret to protect ad-hoc calls to the endpoint. If set, callers must include header `x-imap-secret: <secret>`.
- `CRON_SECRET` — when using Vercel Cron, Vercel will include this secret in the `Authorization` header as `Bearer <CRON_SECRET>`. Set this in Vercel Project Settings and keep it secret.

Security note: do not commit credentials to the repository. Use Vercel's UI to add these values for Production and Preview environments.

Scheduling options
- Vercel Cron (recommended if available): configure a Cron Job to POST to `https://<your-deployment>/api/imap-check` at your desired interval and include the `x-imap-secret` header.
 - Vercel Cron (recommended if available): configure a Cron Job to POST to `https://<your-deployment>/api/imap-check` at your desired interval. Vercel will include the `Authorization: Bearer <CRON_SECRET>` header automatically for cron jobs — set `CRON_SECRET` in your Vercel Project Settings.
- GitHub Actions: create a workflow that runs on a schedule and calls the endpoint. Example `.github/workflows/imap-check.yml`:

```yaml
name: Run IMAP check
on:
	schedule:
		- cron: '*/5 * * * *' # every 5 minutes
	workflow_dispatch:

jobs:
	call-imap:
		runs-on: ubuntu-latest
		steps:
			- name: Call IMAP check
				run: |
					curl -X POST \
						-H "x-imap-secret: ${{ secrets.IMAP_CHECK_SECRET }}" \
						"https://your-deployment.vercel.app/api/imap-check"

```

Replace `your-deployment.vercel.app` with your Vercel production domain and add `IMAP_CHECK_SECRET` as a GitHub Secret.

Local testing
- You can run the local worker (`scripts/imapWorker.mjs`) or call the route locally after setting the same env vars in a local `.env` file.

If you'd like, I can add the GitHub Actions workflow file to this repo and a short example of a curl command to test the endpoint.
