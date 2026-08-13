const express = require('express');
const { encryptPayload, readPem } = require('../lib/secure-payload');
const { getOrMintBuyerRef } = require('../lib/buyer');

const planRouter = express.Router();

planRouter.post('/session', (req, res) => {
    try {
        // Mint or retrieve the buyerRef cookie[cite: 1]
        const buyerRef = getOrMintBuyerRef(req, res);
        
        // Load the private key[cite: 1]
        const privateKey = readPem(process.env.FS_PRIVATE_KEY_PATH);
        
        // Build the payload for the base subscription[cite: 1]
        const payload = {
            reset: true,
            items: [{ product: process.env.FS_PLAN_PRODUCT, quantity: 1 }],
            tags: { buyerRef, fsbStep: "plan" }
        };

        // Encrypt the payload[cite: 1]
        const secure = encryptPayload(payload, privateKey);

        // Return the required configuration back to the browser
        res.status(200).json({
            secure,
            storefront: process.env.FS_STOREFRONT,
            accessKey: process.env.FS_ACCESS_KEY
        });
    } catch (error) {
        console.error('Error generating plan session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = planRouter;