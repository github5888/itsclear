# itsclear - 3-Minute aaPanel Deployment Guide

Both clean deployment zip packages have been generated in your project root:
1. **Frontend Package:** `itsclear-frontend-deploy.zip` (13 MB) - Contains compiled assets with root-level `index.html`.
2. **Backend Package:** `itsclear-backend-deploy.zip` (63 KB) - Contains complete Node.js/Express server (excluding bulky `node_modules`).

---

## Step 1: Deploy Frontend in aaPanel

1. Log into your **aaPanel** dashboard.
2. Go to **Website** -> Click **Add site** (e.g. `itsclear.in` or your domain).
3. Open aaPanel **File Manager** and navigate to:
   ```
   /www/wwwroot/itsclear.in
   ```
4. Delete any default placeholder files (`index.html`, `404.html`).
5. Upload **`itsclear-frontend-deploy.zip`** (or `itsclear-build.zip`) and click **Unzip** directly into `/www/wwwroot/itsclear.in`.
6. Verify that `index.html` is directly located at:
   ```
   /www/wwwroot/itsclear.in/index.html
   ```

---

## Step 2: Deploy Backend in aaPanel

1. In aaPanel File Manager, create a folder for the API, for example:
   ```
   /www/wwwroot/itsclear-api
   ```
2. Upload **`itsclear-backend-deploy.zip`** into `/www/wwwroot/itsclear-api` and click **Unzip**.
3. Open the aaPanel **Terminal** (or SSH into your server):
   ```bash
   cd /www/wwwroot/itsclear-api
   npm install --omit=dev
   ```
4. Configure your `.env` file in `/www/wwwroot/itsclear-api/.env`:
   - Set `MONGODB_URI=mongodb://127.0.0.1:27017/itsclear`
   - Set your Gmail SMTP (`SMTP_USER` and `SMTP_PASS`) or Resend API key.
5. Start the backend with PM2:
   ```bash
   pm2 start index.js --name "itsclear-api"
   pm2 save
   pm2 startup
   ```

---

## Step 3: Configure aaPanel Nginx Reverse Proxy

In aaPanel -> **Website** -> Click your website (`itsclear.in`) -> **Reverse Proxy** -> **Add Reverse Proxy**:

* **Proxy Name:** `api-proxy`
* **Target URL:** `http://127.0.0.1:5001`
* **Sent Domain:** `$host`
* **Mobile Directory / Path:** `/api`

### URL Rewrite (for React Single Page App routing)
In website settings -> **URL Rewrite**, paste:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## Step 4: Enable Free SSL Certificate

1. In website settings -> Click **SSL**.
2. Select **Let's Encrypt**, select your domain names, and click **Apply**.
3. Toggle on **Force HTTPS**.

Your site is now 100% LIVE with Flipkart-style authentication, checkout, and MongoDB database!
