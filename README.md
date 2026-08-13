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