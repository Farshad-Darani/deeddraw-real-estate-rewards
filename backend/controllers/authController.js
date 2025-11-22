const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { verifyRecaptcha } = require('../utils/recaptcha');
const { normalizeEmail } = require('../utils/emailNormalizer');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { 
    generateVerificationCode, 
    sendVerificationEmail,
    sendPasswordResetEmail 
} = require('../utils/emailService');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            category,
            company,
            address,
            city,
            province,
            postalCode,
            referredBy
        } = req.body;

        // Normalize email (remove dots for Gmail addresses)
        const normalizedEmail = normalizeEmail(email);

        // Verify reCAPTCHA (skip in development if not provided)
        const recaptchaToken = req.body.recaptchaToken;
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (recaptchaToken) {
            const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
            
            if (!isRecaptchaValid) {
                return res.status(400).json({
                    success: false,
                    message: 'reCAPTCHA verification failed. Please try again.'
                });
            }
        } else if (!isDevelopment) {
            // In production, reCAPTCHA is required
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification is required.'
            });
        } else {
            console.warn('⚠️  DEV MODE: Skipping reCAPTCHA validation');
        }

        // Check if user already exists (using normalized email comparison to prevent duplicates like d1.farshad and d1farshad)
        // Get users with similar email (without dots) to check for duplicates
        const allUsers = await User.findAll({
            where: {
                email: {
                    [Op.like]: `%${normalizedEmail.replace(/@/g, '%@')}%`
                }
            }
        });
        
        // Check if any user has the same normalized email
        const existingUser = allUsers.find(u => normalizeEmail(u.email) === normalizedEmail);
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Validate referral code if provided
        let referrerUser = null;
        if (referredBy) {
            referrerUser = await User.findOne({ where: { referralCode: referredBy } });
            if (!referrerUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid referral code'
                });
            }
        }

        // Create user
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase().trim(), // Store ORIGINAL email with dots for display
            phone,
            password,
            category,
            company,
            address,
            city,
            province,
            postalCode,
            referredBy: referredBy || null,
            isVerified: isDevelopment ? false : false, // Will be set to true after email verification
            isAdmin: false,
            emailVerificationToken: verificationCode,
            emailVerificationExpires: verificationExpires
        });

        // Send verification email
        let emailSent = false;
        try {
            await sendVerificationEmail(normalizedEmail, firstName, verificationCode);
            console.log(`✅ Verification email sent to: ${normalizedEmail}`);
            emailSent = true;
        } catch (emailError) {
            console.error('❌ Error sending verification email:', emailError.message);
            console.warn('⚠️  Continuing registration without email verification');
            // In development, auto-verify if email fails
            if (isDevelopment) {
                console.warn('🔧 DEV MODE: Email verification will be skipped');
            }
        }

        // Log referral info if applicable
        if (referrerUser) {
            console.log(`✅ User ${user.email} registered with referral code: ${referredBy} from ${referrerUser.email}`);
        }

        // If email wasn't sent in development, provide the code in response for testing
        const responseData = {
            userId: user.id,
            email: user.email,
            requiresVerification: true
        };

        // In development, if email failed, include verification code
        if (isDevelopment && !emailSent) {
            responseData.verificationCode = verificationCode;
            responseData.message = '⚠️ Email service not configured. Use this code: ' + verificationCode;
        }

        res.status(201).json({
            success: true,
            message: emailSent 
                ? 'Registration successful. Please check your email for verification code.' 
                : 'Registration successful. Verification code: ' + (isDevelopment ? verificationCode : 'Check server logs'),
            data: responseData
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, rememberMe } = req.body;

        // Normalize email for lookup
        const normalizedEmail = normalizeEmail(email);

        // Verify reCAPTCHA (skip in development if not provided)
        const recaptchaToken = req.body.recaptchaToken;
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (recaptchaToken) {
            const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
            
            if (!isRecaptchaValid) {
                return res.status(400).json({
                    success: false,
                    message: 'reCAPTCHA verification failed. Please try again.'
                });
            }
        } else if (!isDevelopment) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification is required.'
            });
        } else {
            console.warn('⚠️  DEV MODE: Skipping reCAPTCHA validation for login');
        }

        // Check if user exists (using normalized email comparison for Gmail dot-ignoring)
        // Find user by email (first try exact match, then try normalized)
        let user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
        
        // If not found, try to find by normalized email (for Gmail without dots)
        if (!user) {
            const allUsers = await User.findAll();
            user = allUsers.find(u => normalizeEmail(u.email) === normalizedEmail);
        }
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                requiresVerification: true,
                email: user.email
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toPublicJSON(),
                token,
                rememberMe: rememberMe || false
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'phone', 'company', 'address', 'city', 'province', 'postalCode'];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        await req.user.update(updates);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: req.user.toPublicJSON()
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isValid = await req.user.comparePassword(currentPassword);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

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
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email, recaptchaToken } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Verify reCAPTCHA
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (recaptchaToken) {
            const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
            
            if (!isRecaptchaValid) {
                return res.status(400).json({
                    success: false,
                    message: 'reCAPTCHA verification failed. Please try again.'
                });
            }
        } else if (!isDevelopment) {
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification is required.'
            });
        } else {
            console.warn('⚠️  DEV MODE: Skipping reCAPTCHA validation for forgot password');
        }

        // Try to find user by exact email first, then by normalized email (for Gmail dot-ignoring)
        let user = await User.findOne({ where: { email } });
        
        if (!user) {
            const normalizedEmail = normalizeEmail(email);
            user = await User.findOne({ where: { email: normalizedEmail } });
        }

        if (!user) {
            // Email not found in database - inform user
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address'
            });
        }

        // Generate reset token (crypto secure)
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save hashed token to database
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Send email with original token
        try {
            await sendPasswordResetEmail(user.email, user.firstName, resetToken);
            console.log(`✅ Password reset email sent to: ${user.email}`);
        } catch (emailError) {
            console.error('❌ Error sending password reset email:', emailError);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            
            return res.status(500).json({
                success: false,
                message: 'Error sending password reset email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }

        // Check for uppercase, lowercase, number, and special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        }

        // Hash the token from URL
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password (will be hashed by beforeUpdate hook automatically)
        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log(`✅ Password reset successful for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
};

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ 
            where: { 
                email: normalizedEmail,
                emailVerificationToken: code
            } 
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // Check if code is expired
        if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new one.'
            });
        }

        // Verify user
        user.isVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        // Generate JWT token for automatic login
        const token = generateToken(user.id);

        console.log(`✅ Email verified for: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: user.toPublicJSON(),
                token
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying email'
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ where: { email: normalizedEmail } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate new verification code
        const verificationCode = generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.emailVerificationToken = verificationCode;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Send new verification email
        try {
            await sendVerificationEmail(user.email, user.firstName, verificationCode);
            console.log(`✅ New verification email sent to: ${user.email}`);
        } catch (emailError) {
            console.error('❌ Error sending verification email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error sending verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent successfully'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resending verification code'
        });
    }
};

