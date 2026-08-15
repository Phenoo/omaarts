# Artsy by Oma

Next.js site for Oma Achebe’s contemporary art practice and creative studio in Awka, Nigeria.

## Local development

```bash
npm install
npm run dev
```

Use `.env.example` as the production configuration checklist. Keep `.env.local` and hosted secrets out of version control.

## Verification

```bash
npm run typecheck
npm run build
npm run lint
```

The canonical public routes are `/`, `/art`, `/experiences`, `/private-events`, `/about`, and `/contact`. Legacy `/portfolio`, `/work`, `/shop`, `/activities`, `/events`, and `/services` paths redirect to the new information architecture.

## Production requirements

- Configure Firebase client and Admin credentials before enabling enquiry persistence, accounts, or checkout.
- Configure Paystack server/public keys only if checkout is enabled, and verify webhook signing in the deployed environment.
- Configure Resend or SMTP from `support@artsybyoma.com`; publish SPF, DKIM, and DMARC for the sending domain.
- Keep the published Privacy, Terms, Shipping, Returns, and Commission Terms pages accurate as the studio’s services, payment providers, and delivery practices evolve.
- Configure error monitoring, analytics conversion events, uptime checks, backups, and recovery runbooks in the deployment platform.
