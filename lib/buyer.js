const crypto = require('crypto');

const COOKIE_NAME = 'fs_buyer_ref';

function getOrMintBuyerRef(req, res) {
    let buyerRef = getBuyerRef(req);
    if (!buyerRef) {
        // Mint a server-side buyerRef[cite: 1]
        buyerRef = "b_" + crypto.randomBytes(16).toString("base64url");
        res.cookie(COOKIE_NAME, buyerRef, {
            httpOnly: true, // Prevent client-side JS access[cite: 1]
            sameSite: 'lax',
            secure: false, // Set to true if running over HTTPS in production
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
    return buyerRef;
}

function getBuyerRef(req) {
    // Read from cookies only - never trust query params or body[cite: 1]
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    
    const match = cookies.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

module.exports = {
    COOKIE_NAME,
    getOrMintBuyerRef,
    getBuyerRef
};