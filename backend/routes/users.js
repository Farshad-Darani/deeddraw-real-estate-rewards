const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateCertificate } = require('../utils/certificateGenerator');
const { getUserStats } = require('../controllers/transactionController');
const User = require('../models/User');

// Get user statistics
router.get('/stats', protect, getUserStats);

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, company, licenseNumber, province, city, category } = req.body;
        
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Update allowed fields only
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber !== undefined) user.phone = phoneNumber; // Map phoneNumber to phone
        if (company !== undefined) user.company = company;
        if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
        if (province !== undefined) user.province = province;
        if (city !== undefined) user.city = city;
        if (category) user.category = category;
        
        await user.save();
        
        // Return updated user without password
        const updatedUser = user.toJSON();
        delete updatedUser.password;
        
        // Map phone back to phoneNumber for frontend consistency
        updatedUser.phoneNumber = updatedUser.phone;
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }
        
        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        
        // Get user with password
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

// Placeholder routes - will be implemented
router.get('/referrals', protect, (req, res) => {
    res.json({ message: 'User referrals endpoint' });
});

// Validate referral code
router.get('/validate-referral/:code', protect, async (req, res) => {
    try {
        const { code } = req.params;
        const currentUserId = req.user.id;

        // Find user with this referral code
        const referrer = await User.findOne({
            where: { referralCode: code.toUpperCase() },
            attributes: ['id', 'firstName', 'lastName', 'email', 'referralCode']
        });

        if (!referrer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid referral code'
            });
        }

        // Can't use your own referral code
        if (referrer.id === currentUserId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot use your own referral code'
            });
        }

        res.json({
            success: true,
            message: 'Valid referral code',
            referrer: {
                firstName: referrer.firstName,
                lastName: referrer.lastName,
                referralCode: referrer.referralCode
            }
        });

    } catch (error) {
        console.error('Validate referral error:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating referral code'
        });
    }
});


// Generate and download certificate
router.get('/certificate/:type', protect, async (req, res) => {
    try {
        const { type } = req.params;
        const userId = req.user.id;

        // Get user data
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate certificate PDF
        const pdfBuffer = await generateCertificate(user, type);

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=DeedDraw_${type}_Certificate_${user.firstName}_${user.lastName}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating certificate',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
