# FastSpring 1ClickPay (Embedded Upsell) Integration

A complete, cryptographically secure demonstration of FastSpring's 1ClickPay flow using the Store Builder Library (SBL). This implementation features a two-step checkout funnel where a buyer purchases an initial subscription plan on **Screen 1**, and is seamlessly offered a **1-Click Upsell** on **Screen 2** using their vaulted credit card session.

---

## 🚀 Features

* **Secure Payload Encryption:** RSA-2048 encryption using OpenSSL X.509 self-signed certificates to prevent tampering.
* **Webhook Event Ledger:** Real-time processing of `order.completed` events via an HMAC-SHA256 verified endpoint to capture and vault `account.id`.
* **Smart Polling Client:** Hand-off system on the upsell page (`addon.html`) that gracefully waits for asynchronous webhook processing.
* **Dynamic Coupon Application:** Automated promo code application for one-time upsell offers.
* **Fully Custom UI Container:** FastSpring embedded checkout framed dynamically within a dark UI theme.

---

## 📂 Project Structure

```text
├── keys/                   # RSA Keypair directory (Git Ignored)
│   ├── privatekey.pem      # Private key used by backend to sign payloads
│   └── publiccert.pem      # X.509 Certificate uploaded to FastSpring Dashboard
├── lib/
│   ├── buyer.js            # Buyer reference cookie management
│   ├── secure-payload.js   # RSA encryption helper utilities
│   └── webhook.js          # HMAC signature validation helpers
├── public/
│   ├── addon.html          # Screen 2: 1-Click Upsell Checkout Page
│   ├── plan.html           # Screen 1: Initial Subscription Checkout Page
│   └── css/
│       └── fastspring-custom.css  # Custom CSS overrides for FastSpring SBL
├── routes/
│   ├── addon.js            # Generates encrypted 1ClickPay session payload
│   ├── plan.js             # Generates encrypted initial session payload
│   └── webhook.js          # Ingests and verifies FastSpring webhook payloads
├── scripts/
│   └── keygen.js           # Helper script to generate RSA keys
├── .env.example            # Environment variable template
├── .gitignore              # Protects secrets, node_modules, and keys
├── server.js               # Express application entry point
└── package.json            # Dependencies and npm scripts

---

## Prerequisites
Node.js (v16+ recommended)

ngrok (or any public tunneling tool to route webhooks locally)

A FastSpring Account with access to Developer Tools (Store Builder Library & Webhooks)

---

## ⚙️ Installation & Setup
1. Clone the Repository
Bash
git clone [https://github.com/bsteelfs/fsBuilds-Mobile-App-Upsell-Example-Checkout.git](https://github.com/bsteelfs/fsBuilds-Mobile-App-Upsell-Example-Checkout.git)
cd fsBuilds-Mobile-App-Upsell-Example-Checkout
2. Install Dependencies
Bash
npm install
3. Generate RSA Certificates
FastSpring requires a valid X.509 Certificate for secure session signing. Run OpenSSL in your project root to generate the keys/ directory and pair files:

Bash
openssl req -x509 -newkey rsa:2048 -keyout keys/privatekey.pem -out keys/publiccert.pem -days 3650 -nodes -subj "/CN=FastSpring1Click"
4. FastSpring Dashboard Setup
Upload Public Certificate:

Go to FastSpring Dashboard → Developer Tools → Store Builder Library.

Click Add Certificate and paste the entire contents of keys/publiccert.pem.

Save and copy the newly generated Access Key.

Configure Webhook Endpoint:

Start an ngrok tunnel pointing to your local port (3000 default):

Bash
ngrok http 3000
Copy your HTTPS ngrok forwarding URL (e.g., https://your-tunnel.ngrok-free.dev).

Go to FastSpring Dashboard → Developer Tools → Webhooks → Add Event Endpoint.

Set the URL to: https://your-tunnel.ngrok-free.dev/webhooks/fastspring.

Subscribe to the order.completed event.

Copy the HMAC Secret Key.

---

## 🔐 Environment Variables
Create a .env file in the root directory (you can copy .env.example):

Code snippet
PORT=3000
PUBLIC_URL=[https://your-tunnel.ngrok-free.dev](https://your-tunnel.ngrok-free.dev)

# FastSpring Credentials
FS_ACCESS_KEY=your_fastspring_access_key
FS_HMAC_SECRET=your_fastspring_hmac_secret
FS_PRIVATE_KEY_PATH=./keys/privatekey.pem
FS_PUBLIC_CERT_PATH=./keys/publiccert.pem

# Storefronts & Products
FS_STOREFRONT=your_[storefront.test.onfastspring.com/embedded](https://storefront.test.onfastspring.com/embedded)
FS_ADDON_STOREFRONT=your_[storefront.test.onfastspring.com/embedded](https://storefront.test.onfastspring.com/embedded)
FS_PLAN_PRODUCT=annual-subscription
FS_ADDON_PRODUCT=one-time-addon-product
FS_ADDON_COUPON=SPECIAL2026

---

## 🧪 Running & Testing the Flow
1. Start the Express Server
Bash
node server.js
2. Test Screen 1 (Initial Purchase)
Open your browser and navigate to http://localhost:3000/plan.html.

Fill out the checkout form using FastSpring's Test Credit Card:

Card Number: 4242 4242 4242 4242

Expiration: Any future date (12/30)

CVC: 123

Submit payment. Watch your node terminal log:

Plaintext
[Webhook] Success! Saved account <ACCOUNT_ID> for buyer <BUYER_REF>
3. Test Screen 2 (1-Click Upsell)
Upon payment completion, Screen 1 automatically redirects to /addon.html.

Screen 2 performs smart polling to ensure the webhook has processed, fetches the secure session containing account.id, and renders the 1ClickPay checkout.

The customer can purchase the upsell instantly with a single click using their vaulted card (no card input required)!

---

## 🛡️ Security Best Practices
Secrets Management: .env, node_modules/, and the keys/ directory are explicitly ignored in .gitignore. Never commit private keys or secrets to version control.

Webhook Verification: Incoming webhooks are validated using HMAC-SHA256 signature verification before processing or saving any account credentials.