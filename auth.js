// Authentication JavaScript

// Backend API Configuration
const API_URL = 'https://www.deeddraw.com/api';

// Show/Hide forms
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'none';
    
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    
    // Reset reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset(0); // Reset login reCAPTCHA
    }
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('forgot-form').style.display = 'none';
    
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    
    // Reset reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset(1); // Reset register reCAPTCHA
    }
}

function showForgotPassword() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-form').style.display = 'block';
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function showMessage(text, type = 'success') {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message ${type}`;
    messageDiv.textContent = text;
    
    const authCard = document.querySelector('.auth-card');
    authCard.insertBefore(messageDiv, authCard.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// User management
let users = JSON.parse(localStorage.getItem('users')) || [];

// Initialize test users for development (only if no users exist)
function initializeTestUsers() {
    if (users.length === 0) {
        const testUsers = [
            {
                id: 'user_test_001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@test.com',
                phone: '+1-555-0123',
                category: 'agent-broker',
                company: 'ABC Real Estate',
                referralCode: 'JOHN2024',
                referredBy: null,
                password: 'Test123!',
                isAdmin: false,
                isVerified: true,
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                totalPoints: 0,
                totalPaid: 0,
                transactions: [],
                entries: [],
                referralEarnings: 0,
                referrals: []
            },
            {
                id: 'user_test_002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@test.com',
                phone: '+1-555-0456',
                category: 'developer',
                company: 'Smith Development Corp',
                referralCode: 'JANE2024',
                referredBy: null,
                password: 'Test123!',
                isAdmin: false,
                isVerified: true,
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                totalPoints: 0,
                totalPaid: 0,
                transactions: [],
                entries: [],
                referralEarnings: 100, // Has made one referral
                referrals: [
                    {
                        userId: 'user_test_003',
                        name: 'Mike Johnson',
                        email: 'mike@test.com',
                        dateReferred: new Date().toISOString(),
                        bonusAmount: 100
                    }
                ]
            },
            {
                id: 'user_test_003',
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike@test.com',
                phone: '+1-555-0789',
                category: 'individual',
                company: 'Independent',
                referralCode: 'MIKE2024',
                referredBy: 'user_test_002', // Referred by Jane
                password: 'Test123!',
                isAdmin: false,
                isVerified: true,
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                totalPoints: 0,
                totalPaid: 0,
                transactions: [],
                entries: [],
                referralEarnings: 0,
                referrals: []
            },
            {
                id: 'user_admin_001',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@deeddraw.com',
                phone: '+1-555-ADMIN',
                category: 'agent-broker',
                company: 'DeedDraw LLC',
                referralCode: 'ADMIN001',
                referredBy: null,
                password: 'Admin123!',
                isAdmin: true,
                isVerified: true,
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                totalPoints: 0,
                totalPaid: 0,
                transactions: [],
                entries: [],
                referralEarnings: 0,
                referrals: []
            }
        ];
        
        users = testUsers;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize test users on page load
initializeTestUsers();

// Initialize referral codes for existing users
users.forEach(user => {
    if (!user.referralCode) {
        user.referralCode = generateReferralCode();
    }
    if (!user.referralEarnings) {
        user.referralEarnings = 0;
    }
    if (!user.referrals) {
        user.referrals = [];
    }
});
localStorage.setItem('users', JSON.stringify(users));

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateReferralCode() {
    // Generate a 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    const existing = users.find(u => u.referralCode === result);
    if (existing) {
        return generateReferralCode(); // Recursively generate if duplicate
    }
    return result;
}

// Testing helper functions removed for security

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Custom checkbox functionality
    document.querySelectorAll('.checkbox-container').forEach(container => {
        const checkbox = container.querySelector('input[type="checkbox"]');
        const checkmark = container.querySelector('.checkmark');
        
        if (checkbox && checkmark) {
            container.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
    });
    
    // Login form
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Verify reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse(0); // Login form is first (index 0)
        if (!recaptchaResponse) {
            showMessage('Please complete the reCAPTCHA verification', 'error');
            return;
        }
        
        // Add loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        try {
            // Call backend API
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe,
                    recaptchaToken: recaptchaResponse
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token and user data
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userData', JSON.stringify(data.data.user));
                
                // Store session
                const sessionData = {
                    userId: data.data.user.id,
                    email: data.data.user.email,
                    name: `${data.data.user.firstName} ${data.data.user.lastName}`,
                    category: data.data.user.category,
                    loginTime: new Date().toISOString(),
                    rememberMe: rememberMe
                };
                
                if (rememberMe) {
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('userSession', JSON.stringify(sessionData));
                }
                
                showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    // Check if admin
                    if (data.data.user.isAdmin) {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } else {
                // Check if email verification is required
                if (data.requiresVerification) {
                    submitBtn.innerHTML = 'Sign In';
                    submitBtn.disabled = false;
                    showMessage('Please verify your email first. Redirecting...', 'error');
                    setTimeout(() => {
                        window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
                    }, 2000);
                } else {
                    submitBtn.innerHTML = 'Sign In';
                    submitBtn.disabled = false;
                    grecaptcha.reset(0); // Reset login reCAPTCHA on error
                    showMessage(data.message || 'Invalid email or password', 'error');
                }
            }
        } catch (error) {
            submitBtn.innerHTML = 'Sign In';
            submitBtn.disabled = false;
            grecaptcha.reset(0); // Reset login reCAPTCHA on error
            showMessage('Unable to connect to server. Please try again later.', 'error');
        }
    });
    
    // Register form
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('reg-first-name').value.trim();
        const lastName = document.getElementById('reg-last-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const category = document.getElementById('reg-category').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Validation
        if (!firstName || !lastName || !email || !category || !password || !confirmPassword) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate first and last name contain only alphabets and spaces
        if (!/^[a-zA-Z\s]+$/.test(firstName)) {
            showMessage('First name can only contain letters and spaces', 'error');
            return;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(lastName)) {
            showMessage('Last name can only contain letters and spaces', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Verify reCAPTCHA
        const recaptchaResponse = grecaptcha.getResponse(1); // Register form is second (index 1)
        if (!recaptchaResponse) {
            showMessage('Please complete the reCAPTCHA verification', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showMessage('Password must be at least 8 characters with uppercase, lowercase, and number', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (!agreeTerms) {
            showMessage('You must agree to the terms and conditions', 'error');
            return;
        }
        
        // Add loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        try {
            // Call backend API
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    phone: '+1-000-000-0000', // Default phone, can be updated later
                    category: category, // Use selected category from form
                    recaptchaToken: recaptchaResponse
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Check if email verification is required (check nested data.data.requiresVerification)
                if (data.data && data.data.requiresVerification) {
                    // Check if we got a verification code (email service failed)
                    if (data.data.verificationCode) {
                        showMessage(`Account created! 📧 Email service not configured.\n\n🔑 Your verification code: ${data.data.verificationCode}\n\nPlease save this code - you'll need it on the next page.`, 'success');
                    } else {
                        showMessage('Account created! Please check your email for verification code.', 'success');
                    }
                    
                    // Redirect to verification page (longer delay if code is shown)
                    setTimeout(() => {
                        window.location.href = `verify-email.html?email=${encodeURIComponent(email)}`;
                    }, data.data.verificationCode ? 5000 : 2000);
                } else if (data.data && data.data.user) {
                    // Old flow for backwards compatibility (if verification is disabled)
                    localStorage.setItem('authToken', data.data.token);
                    localStorage.setItem('userData', JSON.stringify(data.data.user));
                    
                    const sessionData = {
                        userId: data.data.user.id,
                        email: data.data.user.email,
                        name: `${data.data.user.firstName} ${data.data.user.lastName}`,
                        category: data.data.user.category,
                        loginTime: new Date().toISOString(),
                        rememberMe: true
                    };
                    
                    localStorage.setItem('userSession', JSON.stringify(sessionData));
                    
                    showMessage('Account created successfully! Redirecting to dashboard...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                }
            } else {
                submitBtn.innerHTML = 'Create Account';
                submitBtn.disabled = false;
                grecaptcha.reset(1); // Reset register reCAPTCHA on error
                showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            submitBtn.innerHTML = 'Create Account';
            submitBtn.disabled = false;
            grecaptcha.reset(1); // Reset register reCAPTCHA on error
            showMessage('Unable to connect to server. Please try again later.', 'error');
        }
    });
    
    // Forgot password form
    const forgotForm = document.getElementById('forgot-form');
    forgotForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!validateEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Get reCAPTCHA token
        const recaptchaResponse = grecaptcha.getResponse(2); // Forgot password form is third (index 2)
        if (!recaptchaResponse) {
            showMessage('Please complete the reCAPTCHA verification', 'error');
            return;
        }
        
        // Add loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Call backend API
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    recaptchaToken: recaptchaResponse
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showMessage('Password reset link sent to your email. Check your inbox!', 'success');
                
                setTimeout(() => {
                    showLogin();
                }, 3000);
            } else {
                // Show clear error message - better UX for users who mistype email
                showMessage(data.message || 'Failed to send reset link. Please try again.', 'error');
            }
        } catch (error) {
            showMessage('Unable to connect to server. Please try again later.', 'error');
        } finally {
            submitBtn.innerHTML = 'Send Reset Link';
            submitBtn.disabled = false;
            // Reset reCAPTCHA
            grecaptcha.reset(2);
        }
    });
    
    // Create admin user if doesn't exist
    if (!users.find(u => u.isAdmin)) {
        const adminUser = {
            id: 'admin_user',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@realtorrewards.com',
            phone: '+1-555-123-4567',
            category: 'admin',
            license: 'ADMIN001',
            password: 'Admin123!', // Change this in production
            isAdmin: true,
            isVerified: true,
            registrationDate: new Date().toISOString(),
            lastLogin: null,
            totalPoints: 0,
            totalPaid: 0
        };
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
});

// Check if user is already logged in
function checkExistingSession() {
    // Only redirect if we're on the login page
    if (!window.location.pathname.includes('login.html')) {
        return;
    }
    
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    const userData = localStorage.getItem('userData');
    
    if (sessionData && userData) {
        try {
            const session = JSON.parse(sessionData);
            const user = JSON.parse(userData);
            
            if (user && session.userId && session.email) {
                if (user.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                localStorage.removeItem('userData');
            }
        } catch (error) {
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            localStorage.removeItem('userData');
        }
    }
}

// Run session check on page load
document.addEventListener('DOMContentLoaded', checkExistingSession);

// Password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('reg-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthIndicator = document.getElementById('password-strength') || createPasswordStrengthIndicator();
            
            let strength = 0;
            let feedback = [];
            
            if (password.length >= 8) strength++;
            else feedback.push('At least 8 characters');
            
            if (/[a-z]/.test(password)) strength++;
            else feedback.push('Lowercase letter');
            
            if (/[A-Z]/.test(password)) strength++;
            else feedback.push('Uppercase letter');
            
            if (/\d/.test(password)) strength++;
            else feedback.push('Number');
            
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) strength++;
            else feedback.push('Special character');
            
            updatePasswordStrength(strengthIndicator, strength, feedback);
        });
    }
});

function createPasswordStrengthIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'password-strength';
    indicator.className = 'password-strength';
    
    const passwordInput = document.getElementById('reg-password');
    passwordInput.parentNode.appendChild(indicator);
    
    return indicator;
}

function updatePasswordStrength(indicator, strength, feedback) {
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#dc3545', '#fd7e14', '#6c757d', '#1E2A38', '#2C3E50'];
    
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill" style="width: ${(strength / 5) * 100}%; background-color: ${strengthColors[strength - 1] || '#dc3545'}"></div>
        </div>
        <div class="strength-text">
            Strength: ${strengthLevels[strength - 1] || 'Very Weak'}
            ${feedback.length > 0 ? `<br><small>Missing: ${feedback.join(', ')}</small>` : ''}
        </div>
    `;
}
