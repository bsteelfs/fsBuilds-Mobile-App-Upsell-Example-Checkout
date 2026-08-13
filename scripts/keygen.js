const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '../keys');
const privateKeyPath = path.join(keysDir, 'privatekey.pem');
const publicCertPath = path.join(keysDir, 'publiccert.pem');

// Prevent overwriting existing keys
if (fs.existsSync(privateKeyPath) || fs.existsSync(publicCertPath)) {
    console.error('Error: Keys already exist in /keys. Aborting to prevent overwrite.');
    process.exit(1);
}

// Generate RSA-2048 key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicCertPath, publicKey);

console.log(' Keys generated successfully in /keys directory.');
console.log(' Action Required: Upload keys/publiccert.pem to FastSpring Dashboard (Developer Tools -> Store Builder Library).');