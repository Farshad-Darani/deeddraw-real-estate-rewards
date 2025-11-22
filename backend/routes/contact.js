const express = require('express');
const router = express.Router();
const { sendContactFormEmail } = require('../utils/emailService');

/**
 * @route   POST /api/contact
 * @desc    Handle contact form submission
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Send email to admin
        await sendContactFormEmail(name, email, subject, message);

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

module.exports = router;
