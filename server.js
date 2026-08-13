const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load routers
const { webhookRouter } = require('./routes/webhook');
const planRouter = require('./routes/plan');
const addonRouter = require('./routes/addon');

// Load .env from __dirname to prevent path resolution bugs[cite: 1]
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------
// 1. Webhook Route (MUST BE MOUNTED FIRST)
// ---------------------------------------------------------
// Mount the webhook route with express.raw() before any JSON parser[cite: 1]
app.use('/webhooks/fastspring', express.raw({ type: '*/*', limit: '1mb' }), webhookRouter);

// ---------------------------------------------------------
// 2. Standard Middleware
// ---------------------------------------------------------
// Now it is safe to parse JSON for our standard API routes
app.use(express.json());
app.use(cookieParser()); // Required to read the buyerRef cookie

// Serve static HTML/CSS/JS files from the /public directory[cite: 1]
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------
// 3. API Routes
// ---------------------------------------------------------
app.use('/api/plan', planRouter);
app.use('/api/addon', addonRouter);

app.get('/api/setup', (req, res) => {
    // Diagnostic route; must always return 200[cite: 1]
    res.status(200).json({ status: 'ok' });
});

// ---------------------------------------------------------
// 4. Server Boot
// ---------------------------------------------------------
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

module.exports = app;