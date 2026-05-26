# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Progressive Web App (PWA)

Chatterbox is installable via [Serwist](https://serwist.pages.dev/) (`@serwist/next`). The web manifest lives at `public/manifest.json`; the service worker is built to `public/sw.js` on production builds.

**HTTPS:** Browsers only show the install prompt on secure origins (HTTPS or `http://localhost`).

**Test the install prompt (desktop Chrome/Edge):**

1. `SKIP_ENV_VALIDATION=1 bun run build && bun run start`
2. Open `http://localhost:3000` (or your deployed HTTPS URL).
3. Open DevTools → Application → Manifest and confirm no errors.
4. Use the install icon in the address bar, or Application → Manifest → “Install”.

**Offline fallback:** With the production server running, load a page once, then go offline and navigate to a new document route — you should see the “You’re offline” page at `/~offline`.
