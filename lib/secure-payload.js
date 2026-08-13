const crypto = require('crypto');
const fs = require('fs');

const AES_ALGO = 'aes-128-ecb';

function readPem(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`PEM key file missing at: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
}

/**
 * Encrypts payload object into FastSpring secure session payload and key.
 */
function encryptPayload(payload, privateKeyPem) {
    // Assert no secret variables inside payload[cite: 1]
    const payloadStr = JSON.stringify(payload);
    if (/secret|hmac|password|token/i.test(payloadStr)) {
        throw new Error('Refusing to sign payload containing sensitive secret keywords.');
    }

    const aesKey = crypto.randomBytes(16); // 128-bit key
    const cipher = crypto.createCipheriv(AES_ALGO, aesKey, null); // ECB takes no IV[cite: 1]
    
    const encryptedPayload = Buffer.concat([
        cipher.update(payloadStr, 'utf8'),
        cipher.final()
    ]);

    const encryptedKey = crypto.privateEncrypt(
        { key: privateKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
        aesKey
    );

    return {
        payload: encryptedPayload.toString('base64'),
        key: encryptedKey.toString('base64')
    };
}

module.exports = {
    encryptPayload,
    readPem
};