This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Enquiry inbox configuration

The admin enquiry inbox at `/forAdmin-enquiries@masterMind` requires these server-side environment variables:

- `PSC_API_BASE_URL` and `PSC_API_KEY` for the enquiry API.
- `ENQUIRY_ADMIN_PASSWORD` for admin sign-in.
- `ENQUIRY_ADMIN_SESSION_SECRET` for signing admin sessions. Use a secret with at least 32 characters.

## Razorpay payment configuration

Package checkout requires the following server-side environment variables:

- `RAZORPAY_KEY_ID` for the Razorpay checkout key.
- `RAZORPAY_KEY_SECRET` for creating orders and verifying payment signatures.
- `PSC_API_BASE_URL` and `PSC_API_KEY` for activating purchased packages.

Use Razorpay test credentials while developing and production credentials only in the production environment. Never expose `RAZORPAY_KEY_SECRET` in client-side code.

## Premium test access

Dashboard premium-test access is checked server-side against `getActivePlans` and `getPackagesDetails`. A plan must be active and unexpired, and its included course ID or course name must match the test metadata. The same check runs before premium questions are returned.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
