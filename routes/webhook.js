const express = require('express');
const { verifySignature } = require('../lib/webhook');

// In-memory ledger for local testing
const processedEvents = new Set();
const completedOrders = []; 

const webhookRouter = express.Router();

webhookRouter.post('/', (req, res) => {
    const signature = req.headers['x-fs-signature'];
    const secret = process.env.FS_HMAC_SECRET;

    // req.body is the raw Buffer because of express.raw() in server.js
    if (!verifySignature(signature, req.body, secret)) {
        console.error('Webhook signature verification failed.');
        return res.status(401).send('Unauthorized');
    }

    try {
        const payload = JSON.parse(req.body.toString('utf8'));
        
        payload.events.forEach(event => {
            // Idempotency check using both event id and order id[cite: 1]
            const eventKey = `${event.id}_${event.data?.id}`;
            if (processedEvents.has(eventKey)) return;
            
            if (event.type === 'order.completed') {
                const data = event.data;
                
// FastSpring might send a string OR an object depending on the payload structure
const accountId = typeof data.account === 'string' ? data.account : data.account?.id;
                
                // The buyerRef comes from the order tags in the signed payload[cite: 1]
                const buyerRef = data.tags && data.tags.buyerRef ? data.tags.buyerRef : null;

                if (buyerRef && accountId) {
                    completedOrders.push({
                        buyerRef,
                        accountId,
                        orderId: data.id,           // Store data.id[cite: 1]
                        reference: data.reference,  // Store data.reference separately[cite: 1]
                        order: data.order           // Store data.order separately[cite: 1]
                    });
                    console.log(`[Webhook] Success! Saved account ${accountId} for buyer ${buyerRef}`);
                }
            }
            
            processedEvents.add(eventKey);
        });

        // Return 200 fast to acknowledge receipt[cite: 1]
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook processing error:', error);
        // Release claims and return 500 so FastSpring retries[cite: 1]
        res.status(500).send('Internal Server Error');
    }
});

module.exports = { webhookRouter, completedOrders };