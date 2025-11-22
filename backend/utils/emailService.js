const nodemailer = require('nodemailer');

// Email configuration - using Hostinger SMTP
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.hostinger.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || 'noreply@deeddraw.com';
const EMAIL_PASSWORD = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || '';

console.log('🔧 Email Configuration:');
console.log('   🏢 Host:', EMAIL_HOST);
console.log('   � Port:', EMAIL_PORT);
console.log('   �📧 User:', EMAIL_USER);
console.log('   🔑 Password length:', EMAIL_PASSWORD.length, 'characters');

// Create transporter with Hostinger SMTP
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
let emailServiceReady = false;
transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.error('⚠️  Email features will be disabled. Please check your Hostinger email configuration.');
        console.error('');
        console.error('📧 Hostinger Email Setup:');
        console.error('   1. Verify EMAIL_HOST is set to: smtp.hostinger.com');
        console.error('   2. Verify EMAIL_PORT is set to: 587');
        console.error('   3. Verify EMAIL_USER is your Hostinger email (e.g., noreply@deeddraw.com)');
        console.error('   4. Verify EMAIL_APP_PASSWORD is your Hostinger email password');
        console.error('   5. Check that the email account exists in Hostinger control panel');
        console.error('');
        emailServiceReady = false;
    } else {
        console.log('✅ Email service is ready to send emails');
        console.log('   📧 Configured:', EMAIL_USER);
        console.log('   🏢 Using Hostinger SMTP');
        emailServiceReady = true;
    }
});

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email with 6-digit code
 */
const sendVerificationEmail = async (email, firstName, verificationCode) => {
    const mailOptions = {
        from: {
            name: 'DeedDraw',
            address: 'noreply@deeddraw.com'
        },
        replyTo: 'support@deeddraw.com',
        to: email,
        subject: 'Verify Your DeedDraw Account',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #1E293B;
                    }
                    .message {
                        font-size: 16px;
                        color: #475569;
                        margin-bottom: 30px;
                        line-height: 1.8;
                    }
                    .code-container {
                        background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
                    }
                    .code-label {
                        font-size: 14px;
                        color: #1E293B;
                        font-weight: 600;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .code {
                        font-size: 48px;
                        font-weight: 800;
                        color: white;
                        letter-spacing: 8px;
                        margin: 10px 0;
                        font-family: 'Courier New', monospace;
                        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    }
                    .code-info {
                        font-size: 13px;
                        color: #1E293B;
                        margin-top: 10px;
                        font-weight: 500;
                    }
                    .warning {
                        background-color: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        padding: 15px 20px;
                        margin: 25px 0;
                        border-radius: 6px;
                    }
                    .warning-text {
                        font-size: 14px;
                        color: #92400E;
                        margin: 0;
                    }
                    .footer {
                        background-color: #F8FAFC;
                        padding: 30px;
                        text-align: center;
                        border-top: 1px solid #E2E8F0;
                    }
                    .footer-text {
                        font-size: 13px;
                        color: #64748B;
                        margin: 5px 0;
                    }
                    .footer-link {
                        color: #F59E0B;
                        text-decoration: none;
                        font-weight: 600;
                    }
                    .footer-link:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎯 DeedDraw</h1>
                        <p>Welcome to Canada's Premier Real Estate Rewards Platform</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello ${firstName}! 👋</div>
                        <div class="message">
                            Thank you for joining DeedDraw! We're excited to have you as part of Canada's most rewarding real estate community.
                            <br><br>
                            To complete your registration and start earning points towards life-changing prizes, please verify your email address using the code below:
                        </div>
                        
                        <div class="code-container">
                            <div class="code-label">Your Verification Code</div>
                            <div class="code">${verificationCode}</div>
                            <div class="code-info">⏰ This code expires in 10 minutes</div>
                        </div>

                        <div class="warning">
                            <p class="warning-text">
                                🔒 <strong>Security Notice:</strong> This code is confidential. Never share it with anyone. DeedDraw staff will never ask for your verification code.
                            </p>
                        </div>

                        <div class="message">
                            If you didn't create a DeedDraw account, please ignore this email or contact our support team.
                        </div>
                    </div>
                    <div class="footer">
                        <p class="footer-text">
                            <strong>DeedDraw</strong> - Turn Real Estate Deals into Life-Changing Rewards
                        </p>
                        <p class="footer-text">
                            Questions? <a href="mailto:Aminvaziri1974@gmail.com" class="footer-link">Contact Support</a>
                        </p>
                        <p class="footer-text" style="margin-top: 20px; font-size: 11px;">
                            © ${new Date().getFullYear()} DeedDraw. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        throw error;
    }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password.html?token=${resetToken}`;
    
    const mailOptions = {
        from: {
            name: 'DeedDraw',
            address: 'noreply@deeddraw.com'
        },
        replyTo: 'support@deeddraw.com',
        to: email,
        subject: 'Reset Your DeedDraw Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 20px;
                        color: #1E293B;
                    }
                    .message {
                        font-size: 16px;
                        color: #475569;
                        margin-bottom: 30px;
                        line-height: 1.8;
                    }
                    .button-container {
                        text-align: center;
                        margin: 35px 0;
                    }
                    .reset-button {
                        display: inline-block;
                        padding: 16px 40px;
                        background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 16px;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                        transition: all 0.3s ease;
                    }
                    .reset-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
                    }
                    .expire-info {
                        text-align: center;
                        font-size: 14px;
                        color: #64748B;
                        margin-top: 20px;
                    }
                    .warning {
                        background-color: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        padding: 15px 20px;
                        margin: 25px 0;
                        border-radius: 6px;
                    }
                    .warning-text {
                        font-size: 14px;
                        color: #92400E;
                        margin: 0;
                    }
                    .footer {
                        background-color: #F8FAFC;
                        padding: 30px;
                        text-align: center;
                        border-top: 1px solid #E2E8F0;
                    }
                    .footer-text {
                        font-size: 13px;
                        color: #64748B;
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset</h1>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello ${firstName},</div>
                        <div class="message">
                            We received a request to reset your DeedDraw account password. Click the button below to create a new password:
                        </div>
                        
                        <div class="button-container">
                            <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
                            <div class="expire-info">⏰ This link expires in 1 hour</div>
                        </div>

                        <div class="warning">
                            <p class="warning-text">
                                🔒 <strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your account is secure.
                            </p>
                        </div>

                        <div class="message" style="font-size: 13px; color: #64748B; margin-top: 30px;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <span style="color: #F59E0B; word-break: break-all;">${resetUrl}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p class="footer-text">
                            <strong>DeedDraw</strong> - Secure Real Estate Rewards Platform
                        </p>
                        <p class="footer-text" style="margin-top: 20px; font-size: 11px;">
                            © ${new Date().getFullYear()} DeedDraw. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent:', info.messageId);
        console.log('   📧 To:', email);
        console.log('   📤 From:', mailOptions.from.address);
        console.log('   📬 Response:', info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        console.error('   📧 To:', email);
        console.error('   📤 From:', mailOptions.from.address);
        throw error;
    }
};

/**
 * Send contact form email
 */
const sendContactFormEmail = async (name, email, subject, message) => {
    const mailOptions = {
        from: {
            name: 'DeedDraw Contact Form',
            address: 'info@deeddraw.com'
        },
        to: 'support@deeddraw.com',
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
                    .header {
                        background-color: #1E293B;
                        color: white;
                        padding: 15px;
                        border-radius: 6px 6px 0 0;
                    }
                    .content {
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .field {
                        margin-bottom: 15px;
                    }
                    .label {
                        font-weight: bold;
                        color: #1E293B;
                    }
                    .value {
                        margin-top: 5px;
                        padding: 10px;
                        background-color: white;
                        border-left: 3px solid #F59E0B;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>📧 New Contact Form Submission</h2>
                    </div>
                    <div class="content">
                        <div class="field">
                            <div class="label">From:</div>
                            <div class="value">${name}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email:</div>
                            <div class="value">${email}</div>
                        </div>
                        <div class="field">
                            <div class="label">Subject:</div>
                            <div class="value">${subject}</div>
                        </div>
                        <div class="field">
                            <div class="label">Message:</div>
                            <div class="value">${message.replace(/\n/g, '<br>')}</div>
                        </div>
                        <div style="margin-top: 20px; padding: 10px; background-color: #FEF3C7; border-radius: 6px;">
                            <small style="color: #92400E;">
                                Reply directly to this email to respond to ${name}
                            </small>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Contact form email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending contact form email:', error);
        throw error;
    }
};

/**
 * Send e-Transfer instructions email
 */
const sendETransferInstructions = async (userEmail, userName, amount, certificateNumber) => {
    if (!emailServiceReady) {
        console.warn('⚠️  Email service not ready, skipping e-Transfer instructions email');
        return { success: false, reason: 'Email service not configured' };
    }

    const mailOptions = {
        from: {
            name: 'DeedDraw Payments',
            address: 'payment@deeddraw.com'
        },
        replyTo: 'support@deeddraw.com',
        to: userEmail,
        subject: '📧 E-Transfer Payment Instructions - DeedDraw',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #c8a15a 0%, #a07d3f 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">DeedDraw</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">E-Transfer Payment Instructions</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Hi ${userName}! 👋</h2>
                        
                        <p style="color: #333; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                            Thank you for registering your entry! Your entry is currently <strong>pending</strong> until we receive your e-Transfer payment.
                        </p>

                        <!-- Important Notice -->
                        <div style="background: #fff3cd; border-left: 4px solid #c8a15a; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                <strong>⚠️ Important:</strong> Please complete your payment within 24 hours to activate your entry. Keep this email for your records.
                            </p>
                        </div>

                        <!-- Payment Instructions -->
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 30px; margin: 0 0 30px 0;">
                            <h3 style="color: #c8a15a; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📧 E-TRANSFER INSTRUCTIONS</h3>
                            
                            <div style="border-bottom: 1px solid #dee2e6; margin: 0 0 20px 0;"></div>

                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; vertical-align: top;">
                                        <span style="color: #c8a15a; font-size: 20px; margin-right: 10px;">1️⃣</span>
                                    </td>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #333; display: block; margin-bottom: 5px;">Open Your Online Banking</strong>
                                        <span style="color: #666; font-size: 14px;">Navigate to your bank's Interac e-Transfer section</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; vertical-align: top;">
                                        <span style="color: #c8a15a; font-size: 20px; margin-right: 10px;">2️⃣</span>
                                    </td>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #333; display: block; margin-bottom: 5px;">Send e-Transfer to:</strong>
                                        <div style="background: white; padding: 12px; border-radius: 6px; border: 2px solid #c8a15a; margin-top: 8px;">
                                            <code style="color: #c8a15a; font-size: 18px; font-weight: bold;">payment@deeddraw.com</code>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; vertical-align: top;">
                                        <span style="color: #c8a15a; font-size: 20px; margin-right: 10px;">3️⃣</span>
                                    </td>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #333; display: block; margin-bottom: 5px;">Amount:</strong>
                                        <div style="background: white; padding: 12px; border-radius: 6px; border: 2px solid #c8a15a; margin-top: 8px;">
                                            <code style="color: #c8a15a; font-size: 18px; font-weight: bold;">$${amount.toLocaleString()}</code>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; vertical-align: top;">
                                        <span style="color: #c8a15a; font-size: 20px; margin-right: 10px;">4️⃣</span>
                                    </td>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #333; display: block; margin-bottom: 5px;">Security Question:</strong>
                                        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #dee2e6; margin-top: 8px;">
                                            <code style="color: #333; font-size: 16px;">Certificate Number?</code>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; vertical-align: top;">
                                        <span style="color: #c8a15a; font-size: 20px; margin-right: 10px;">5️⃣</span>
                                    </td>
                                    <td style="padding: 12px 0;">
                                        <strong style="color: #333; display: block; margin-bottom: 5px;">Security Answer:</strong>
                                        <div style="background: white; padding: 12px; border-radius: 6px; border: 2px solid #c8a15a; margin-top: 8px;">
                                            <code style="color: #c8a15a; font-size: 18px; font-weight: bold;">${certificateNumber}</code>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- What's Next -->
                        <div style="background: #e7f3ff; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                            <h4 style="color: #004085; margin: 0 0 15px 0; font-size: 18px;">✨ What Happens Next?</h4>
                            <ul style="color: #004085; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li>Your entry will be verified within 24 hours after payment</li>
                                <li>You'll receive a confirmation email once approved</li>
                                <li>Your points will be added to your account</li>
                                <li>Check your dashboard for real-time status updates</li>
                            </ul>
                        </div>

                        <!-- Support -->
                        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; text-align: center;">
                            Need help? Contact us at <a href="mailto:support@deeddraw.com" style="color: #c8a15a; text-decoration: none;">support@deeddraw.com</a>
                        </p>

                        <!-- Footer -->
                        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #dee2e6;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                © 2025 DeedDraw. All rights reserved.<br>
                                <a href="https://www.deeddraw.com" style="color: #c8a15a; text-decoration: none;">www.deeddraw.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ E-Transfer instructions email sent:', info.messageId);
        console.log('   📧 To:', userEmail);
        console.log('   💰 Amount: $' + amount);
        console.log('   🎫 Certificate:', certificateNumber);
        console.log('   📤 From:', mailOptions.from.address);
        console.log('   📬 Response:', info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending e-Transfer instructions email:', error);
        console.error('   📧 To:', userEmail);
        console.error('   📤 From:', mailOptions.from.address);
        throw error;
    }
};

/**
 * Send payment approval confirmation email
 */
const sendPaymentApprovalEmail = async (userEmail, userName, amount, points, certificateNumber) => {
    if (!emailServiceReady) {
        console.warn('⚠️  Email service not ready, skipping payment approval email');
        return { success: false, reason: 'Email service not configured' };
    }

    const mailOptions = {
        from: {
            name: 'DeedDraw Payments',
            address: 'payment@deeddraw.com'
        },
        replyTo: 'support@deeddraw.com',
        to: userEmail,
        subject: '✅ Payment Approved - Your Entry is Now Active!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #c8a15a 0%, #a07d3f 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 DeedDraw</h1>
                        <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px; font-weight: 600;">Payment Approved!</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 26px;">Congratulations, ${userName}! 🎊</h2>
                        
                        <p style="color: #333; line-height: 1.8; margin: 0 0 30px 0; font-size: 16px;">
                            Great news! Your payment has been <strong style="color: #c8a15a;">approved and verified</strong>. Your entry is now <strong style="color: #10b981;">ACTIVE</strong> and you're officially in the draw!
                        </p>

                        <!-- Success Box -->
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px 0; text-align: center;">
                            <div style="color: white; font-size: 48px; margin-bottom: 10px;">✓</div>
                            <h3 style="color: white; margin: 0 0 10px 0; font-size: 22px;">Entry Verified!</h3>
                            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Your participation is confirmed</p>
                        </div>

                        <!-- Certificate Details -->
                        <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin: 0 0 30px 0; border: 2px solid #c8a15a;">
                            <h3 style="color: #c8a15a; margin: 0 0 25px 0; font-size: 20px; text-align: center;">📜 Your Certificate Details</h3>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6;">
                                        <strong style="color: #64748b; font-size: 14px;">Certificate Number:</strong>
                                    </td>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                                        <code style="background: white; padding: 8px 16px; border-radius: 6px; color: #c8a15a; font-size: 18px; font-weight: bold;">${certificateNumber}</code>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6;">
                                        <strong style="color: #64748b; font-size: 14px;">Points Earned:</strong>
                                    </td>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #dee2e6; text-align: right;">
                                        <span style="color: #1a1a1a; font-size: 18px; font-weight: bold;">${points} Points</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0;">
                                        <strong style="color: #64748b; font-size: 14px;">Amount Paid:</strong>
                                    </td>
                                    <td style="padding: 15px 0; text-align: right;">
                                        <span style="color: #1a1a1a; font-size: 18px; font-weight: bold;">$${amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- What's Next -->
                        <div style="background: #e7f3ff; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;">
                            <h4 style="color: #004085; margin: 0 0 15px 0; font-size: 18px;">🚀 What's Next?</h4>
                            <ul style="color: #004085; margin: 0; padding-left: 25px; line-height: 2;">
                                <li>Your points have been added to your account</li>
                                <li>You can view your certificate in your dashboard</li>
                                <li>Track your progress toward amazing prizes</li>
                                <li>Refer friends to earn bonus points</li>
                            </ul>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 0 0 30px 0;">
                            <a href="https://www.deeddraw.com/dashboard.html" style="display: inline-block; background: linear-gradient(135deg, #c8a15a 0%, #a07d3f 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(200, 161, 90, 0.3);">
                                View Dashboard →
                            </a>
                        </div>

                        <!-- Support -->
                        <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 14px; text-align: center;">
                            Questions? Contact us at <a href="mailto:support@deeddraw.com" style="color: #c8a15a; text-decoration: none;">support@deeddraw.com</a>
                        </p>

                        <!-- Footer -->
                        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #dee2e6;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                © 2025 DeedDraw. All rights reserved.<br>
                                <a href="https://www.deeddraw.com" style="color: #c8a15a; text-decoration: none;">www.deeddraw.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Payment approval email sent:', info.messageId);
        console.log('   📧 To:', userEmail);
        console.log('   🎫 Certificate:', certificateNumber);
        console.log('   💰 Amount: $' + amount);
        console.log('   ⭐ Points:', points);
        console.log('   📤 From:', mailOptions.from.address);
        console.log('   📬 Response:', info.response);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending payment approval email:', error);
        console.error('   📧 To:', userEmail);
        console.error('   📤 From:', mailOptions.from.address);
        throw error;
    }
};

module.exports = {
    generateVerificationCode,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendContactFormEmail,
    sendETransferInstructions,
    sendPaymentApprovalEmail
};
