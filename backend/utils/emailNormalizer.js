/**
 * Normalize email addresses for consistent storage and comparison
 * Gmail and some other providers ignore dots in the local part of email addresses
 * e.g., d1.fashad@gmail.com and d1fashad@gmail.com are the same address
 */

const normalizeEmail = (email) => {
    if (!email) return email;
    
    // Convert to lowercase
    email = email.toLowerCase().trim();
    
    // Split into local part and domain
    const [localPart, domain] = email.split('@');
    
    if (!domain) return email;
    
    // List of domains that ignore dots in email addresses
    const dotsIgnoredDomains = [
        'gmail.com',
        'googlemail.com'
    ];
    
    // Check if this domain ignores dots
    if (dotsIgnoredDomains.includes(domain.toLowerCase())) {
        // Remove all dots from the local part
        const normalizedLocal = localPart.replace(/\./g, '');
        return `${normalizedLocal}@${domain}`;
    }
    
    // For other domains, just return lowercase
    return email;
};

module.exports = { normalizeEmail };
