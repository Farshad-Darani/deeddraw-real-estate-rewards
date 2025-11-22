const https = require('https');

/**
 * Verify Google reCAPTCHA v2 response
 * @param {string} token - The reCAPTCHA response token from the client
 * @returns {Promise<boolean>} - Returns true if verification succeeds
 */
async function verifyRecaptcha(token) {
    // Skip verification in development if no token provided
    if (process.env.NODE_ENV === 'development' && !token) {
        console.log('⚠️  Development mode: Skipping reCAPTCHA verification');
        return true;
    }

    if (!token) {
        return false;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
        console.error('❌ RECAPTCHA_SECRET_KEY not configured in .env');
        // In development, allow it to pass
        if (process.env.NODE_ENV === 'development') {
            return true;
        }
        return false;
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    return new Promise((resolve) => {
        https.get(verificationUrl, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('🔐 reCAPTCHA verification result:', result.success);
                    resolve(result.success === true);
                } catch (error) {
                    console.error('❌ Error parsing reCAPTCHA response:', error);
                    resolve(false);
                }
            });
        }).on('error', (error) => {
            console.error('❌ Error verifying reCAPTCHA:', error);
            // In development, allow it to pass on error
            if (process.env.NODE_ENV === 'development') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

module.exports = { verifyRecaptcha };
