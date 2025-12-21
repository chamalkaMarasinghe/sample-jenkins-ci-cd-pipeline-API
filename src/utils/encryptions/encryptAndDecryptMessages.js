const crypto = require('crypto');
const currentEnvironment = require('../../config/environmentConfig')
const ENCRYPTION_KEY = currentEnvironment.ENCRYPTION_KEY;
// Load the 32-byte encryption key from the environment variable
const encryptionKey = Buffer.from(ENCRYPTION_KEY, 'base64');
const ALGORITHM = 'aes-256-cbc';

// Function: to encrypt a message 
exports.encryptMessage = (message = '') => {
    const iv = crypto.randomBytes(16); // Generate a random 16-byte IV
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Return both the IV and the encrypted data as base64-encoded strings
    return {
        iv: iv.toString('base64'),
        encryptedData: encrypted
    };
}

// Function: to decrypt a message
exports.decryptMessage = (encryptedData, iv) => {
    if(!iv || iv?.length < 1){
        return encryptedData;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, Buffer.from(iv, 'base64'));

    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
