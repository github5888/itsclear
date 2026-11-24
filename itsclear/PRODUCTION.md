# Production launch checklist

The application is designed to run as one Node service: Express serves the built Vite frontend and the `/api` routes.

## Required infrastructure

- MongoDB replica set (transactions are required for stock, order and loyalty consistency)
- HTTPS domain/reverse proxy
- Razorpay account with automatic capture enabled
- Resend account with a verified sender domain
- Persistent object storage for product uploads before horizontally scaling beyond one server

## Zero-cost COD mode

`docker compose up --build -d` starts a single-node MongoDB replica set and the full application with persistent Docker volumes. Keep `COD_ENABLED=true` and leave Razorpay credentials empty. The checkout will show only Cash on Delivery and will never simulate an online payment.

For free OTP delivery, create a Google App Password for a dedicated Gmail account and set `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`. Local OTP display is deliberately disabled when `NODE_ENV=production`.

This mode has no software licence or payment-gateway cost. A public store still needs a computer/server, internet connection, domain or reachable URL, verified business details, and operational delivery capacity; the application cannot provision those identities on the owner's behalf.

## Required configuration

Copy `server/.env.example` into the deployment secret manager. Never commit the resulting values.

Production startup fails when `JWT_SECRET` or `OTP_PEPPER` is absent. Use independent random values of at least 32 bytes. Configure the Razorpay webhook URL as:

```text
https://YOUR_DOMAIN/api/payments/webhook
```

Subscribe to `payment.captured`, `payment.failed`, and `refund.processed`. Set the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`.

After the first admin login, rotate the password and remove `ADMIN_INITIAL_PASSWORD` from the environment.

## Deploy

```bash
docker build -t itsclear .
docker run --env-file server/.env -p 5001:5001 itsclear
```

For the included free local stack:

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:5001/api/health
curl http://localhost:5001/api/config
```

The health check is `GET /api/health`. A deployment is ready only when `dbStatus` is `connected`.

## Launch gates

- Complete a Razorpay test-mode purchase and verify the order is absent when payment is dismissed.
- Verify an order is created only after a captured payment or valid COD confirmation.
- Cancel a paid test order and confirm the Razorpay refund webhook marks it refunded.
- Confirm invoice GSTIN/FSSAI values match the legal entity.
- Replace placeholder support phone/address copy in legal pages.
- Back up MongoDB and test a restore.
- Put uploaded media on S3/Cloudinary-compatible storage before multi-instance deployment.

