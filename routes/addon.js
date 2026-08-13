const express = require('express');
const { encryptPayload, readPem } = require('../lib/secure-payload');
const { getBuyerRef } = require('../lib/buyer');
const { completedOrders } = require('./webhook');

const addonRouter = express.Router();

addonRouter.post('/session', (req, res) => {
    try {
        const buyerRef = getBuyerRef(req);
        if (!buyerRef) {
            return res.status(401).json({ error: 'No buyer session found' });
        }

        const order = completedOrders.find(o => o.buyerRef === buyerRef);
        if (!order || !order.accountId) {
            return res.status(400).json({ error: 'No vaulted account found for this buyer' });
        }

        const privateKey = readPem(process.env.FS_PRIVATE_KEY_PATH);
        
        // =========================================================
        // THIS IS WHERE THE COUPON GOES (INSIDE THE PAYLOAD)
        // =========================================================
        const payload = {
            reset: true,
            account: order.accountId, 
            items: [{ product: process.env.FS_ADDON_PRODUCT, quantity: 1 }],
            
            // Pass the coupon code as an array of strings
            coupons: process.env.FS_ADDON_COUPON ? [process.env.FS_ADDON_COUPON] : [],
            
            tags: { buyerRef, fsbStep: "addon" }
        };
        // =========================================================

        const secure = encryptPayload(payload, privateKey);

        res.status(200).json({
    secure,
    storefront: process.env.FS_ADDON_STOREFRONT, 
    accessKey: process.env.FS_ACCESS_KEY,
    coupon: process.env.FS_ADDON_COUPON // Pass to frontend
});
    } catch (error) {
        console.error('Error generating addon session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = addonRouter;