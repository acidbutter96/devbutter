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
