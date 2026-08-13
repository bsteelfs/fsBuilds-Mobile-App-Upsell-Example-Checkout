const crypto = require('crypto');

function verifySignature(signatureHeader, rawBody, secret) {
    if (!signatureHeader || !secret) return false;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('base64');

    // Proxies sometimes pad the header, so trim it[cite: 1]
    const cleanHeader = signatureHeader.trim();
    
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(cleanHeader);

    // timingSafeEqual requires buffers of the exact same length[cite: 1]
    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

module.exports = { verifySignature };