// Backend API Configuration
const API_URL = 'https://www.deeddraw.com/api';

// Original Navigation functionality - Dropdown only
document.addEventListener('DOMContentLoaded', function() {
    // Check user session and update dashboard link
    updateDashboardLink();
    
    // Mobile dropdown toggle functionality  
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdown = document.querySelector('.dropdown');
    
    if (dropdownToggle && dropdownMenu && dropdown) {
        // Initialize: dropdown is open by default on mobile, so arrow should point up
        let isDropdownOpen = true;
        
        // Only set initial mobile state
        if (window.innerWidth <= 768) {
            dropdown.classList.add('active'); // Start with arrow pointing up since menu is open on mobile
        }
        
        function toggleDropdown(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                
                // Toggle the dropdown state
                isDropdownOpen = !isDropdownOpen;
                
                if (isDropdownOpen) {
                    // Opening dropdown - show menu, arrow points up
                    dropdownMenu.style.display = 'block';
                    dropdown.classList.add('active');
                } else {
                    // Closing dropdown - hide menu, arrow points down
                    dropdownMenu.style.display = 'none';
                    dropdown.classList.remove('active');
                }
            }
        }
        
        // Desktop hover functionality
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                dropdown.classList.add('active');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                dropdown.classList.remove('active');
            }
        });
        
        dropdownToggle.addEventListener('click', toggleDropdown);
        dropdownToggle.addEventListener('touchend', toggleDropdown, { passive: false });
    }
});

// Utility Functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function showMessage(text, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Point Calculator - Automatic calculation with number formatting
function calculatePointsAutomatically() {
    const amountInput = document.getElementById('transaction-amount');
    const pointsValueElement = document.getElementById('points-value');
    const registrationCostElement = document.getElementById('registration-cost');
    const ctaButton = document.getElementById('calculator-cta');
    
    // Remove any non-numeric characters except commas, then remove commas for calculation
    let cleanValue = amountInput.value.replace(/[^\d,]/g, '');
    const rawValue = cleanValue.replace(/,/g, '');
    const amount = parseFloat(rawValue);
    
    // Format the input with commas as user types
    if (!isNaN(amount) && rawValue !== '') {
        const formattedValue = numberWithCommas(amount);
        // Only update if the formatted value is different to avoid cursor jumping
        if (amountInput.value !== formattedValue) {
            const cursorPosition = amountInput.selectionStart;
            const oldLength = amountInput.value.length;
            amountInput.value = formattedValue;
            const newLength = amountInput.value.length;
            // Adjust cursor position based on the length difference
            const newCursorPosition = cursorPosition + (newLength - oldLength);
            amountInput.setSelectionRange(newCursorPosition, newCursorPosition);
        }
    } else if (rawValue === '') {
        // Clear the input if it's empty
        amountInput.value = '';
    }
    
    // If input is empty or invalid, show 0 points
    if (isNaN(amount) || amount < 0 || rawValue.trim() === '') {
        pointsValueElement.textContent = '0';
        registrationCostElement.textContent = '$0';
        ctaButton.style.display = 'none';
        return;
    }
    
    let points = 0;
    
    if (amount >= 500000) {
        // Calculate points based on 500k ranges: 500-749=1, 750-1249=2, 1250-1749=3, etc.
        if (amount < 750000) {
            points = 1;
        } else {
            points = Math.floor((amount - 250000) / 500000) + 1;
        }
    }
    
    const registrationCost = points * 2000;
    
    pointsValueElement.textContent = points;
    registrationCostElement.textContent = '$' + numberWithCommas(registrationCost);
    
    // Show/hide and enable/disable CTA button based on points
    const registerButton = ctaButton.querySelector('.btn-register');
    if (points > 0) {
        ctaButton.style.display = 'block';
        registerButton.disabled = false;
        registerButton.style.opacity = '1';
        registerButton.style.cursor = 'pointer';
        registerButton.classList.remove('disabled');
    } else {
        // Show button but in disabled/dark state when no points
        ctaButton.style.display = 'block';
        registerButton.disabled = true;
        registerButton.style.opacity = '0.5';
        registerButton.style.cursor = 'not-allowed';
        registerButton.classList.add('disabled');
    }
}

// Scroll to registration section
function scrollToRegistration() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    if (token) {
        // User is logged in - redirect to dashboard with register tab
        window.location.href = 'dashboard.html#register';
    } else {
        // User is not logged in - redirect to login page
        window.location.href = 'login.html';
    }
}

// Helper function to add commas to numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Legacy Point Calculator (keeping for compatibility)
function calculatePoints() {
    const amountInput = document.getElementById('transaction-amount');
    const amount = parseFloat(amountInput.value);
    const resultDiv = document.getElementById('calculator-result');
    
    if (isNaN(amount) || amount < 0) {
        resultDiv.innerHTML = '<span style="color: #e74c3c;">Please enter a valid transaction amount</span>';
        return;
    }
    
    let points = 0;
    
    if (amount >= 500000) {
        if (amount < 750000) {
            points = 1;
        } else if (amount < 1000000) {
            points = 2;
        } else {
            // For amounts over $1M, add 1 point for every additional $250k
            points = 2 + Math.floor((amount - 1000000) / 250000);
        }
    }
    
    const registrationCost = points * 2000;
    
    resultDiv.innerHTML = `
        <div style="color: #2e7d32; font-size: 1.5rem; margin-bottom: 1rem;">
            <strong>${points} Point${points !== 1 ? 's' : ''} Earned</strong>
        </div>
        <div>
            Transaction Amount: ${formatCurrency(amount)}<br>
            Registration Cost: ${formatCurrency(registrationCost)}<br>
            <small style="color: #666;">Each point costs $2,000 to register</small>
        </div>
    `;
}

// Open Calculator Modal
function openCalculator() {
    scrollToSection('how-it-works');
    // Add a slight delay then scroll to calculator
    setTimeout(() => {
        document.querySelector('.calculator-section').scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

// Registration Form Handler
document.addEventListener('DOMContentLoaded', function() {
    // Points to register calculation
    const pointsInput = document.getElementById('points-to-register');
    const totalCostElement = document.getElementById('total-cost');
    
    if (pointsInput && totalCostElement) {
        pointsInput.addEventListener('input', function() {
            const points = parseInt(this.value) || 0;
            const totalCost = points * 2000;
            totalCostElement.textContent = formatCurrency(totalCost);
        });
    }
    
    // Registration form submission
    const registrationForm = document.getElementById('point-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('participant-name').value,
                email: document.getElementById('participant-email').value,
                phone: document.getElementById('participant-phone').value,
                category: document.getElementById('participant-category').value,
                certificateNumber: document.getElementById('certificate-number').value,
                points: parseInt(document.getElementById('points-to-register').value)
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.phone || !formData.category || 
                !formData.certificateNumber || !formData.points || formData.points < 1) {
                showMessage('Please fill in all fields correctly', 'error');
                return;
            }
            
            const totalCost = formData.points * 2000;
            
            // Show payment modal
            showPaymentModal(formData, totalCost);
        });
    }
    
    // Payment modal handlers
    const modal = document.getElementById('payment-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
});

// Payment Modal
function showPaymentModal(participantData, totalCost) {
    const modal = document.getElementById('payment-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Update modal title with cost
    const title = modalContent.querySelector('h2');
    title.textContent = `Payment - ${formatCurrency(totalCost)}`;
    
    // Store participant data for later use
    modal.setAttribute('data-participant', JSON.stringify(participantData));
    modal.setAttribute('data-cost', totalCost);
    
    modal.style.display = 'block';
}

// Process Payment (This would integrate with a real payment processor)
function processPayment() {
    const modal = document.getElementById('payment-modal');
    const participantData = JSON.parse(modal.getAttribute('data-participant'));
    const totalCost = modal.getAttribute('data-cost');
    
    // Get payment form data
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;
    
    // Basic validation
    if (!cardNumber || !expiry || !cvv || !cardholderName) {
        showMessage('Please fill in all payment fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#payment-form button');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close modal
        modal.style.display = 'none';
        
        // Add participant to registered list
        addParticipant(participantData);
        
        // Show success message
        showMessage(`Payment successful! ${participantData.points} point${participantData.points !== 1 ? 's' : ''} registered for ${participantData.name}`, 'success');
        
        // Reset registration form
        document.getElementById('point-registration-form').reset();
        document.getElementById('total-cost').textContent = '$0';
        
        // Reset payment form
        document.getElementById('payment-form').reset();
        
        // Update progress
        updateProgress(participantData.points);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    }, 2000);
}

// Participant Management
let participants = JSON.parse(localStorage.getItem('participants')) || [];

function addParticipant(participantData) {
    const participant = {
        ...participantData,
        id: Date.now(),
        registrationDate: new Date().toISOString(),
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    participants.push(participant);
    localStorage.setItem('participants', JSON.stringify(participants));
}

function updateProgress(newPoints) {
    const currentPointsElement = document.getElementById('current-points');
    const progressFill = document.querySelector('.progress-fill');
    const pointsRemainingElement = document.getElementById('points-remaining');
    
    if (currentPointsElement && progressFill) {
        let currentPoints = parseInt(currentPointsElement.textContent);
        currentPoints += newPoints;
        
        currentPointsElement.textContent = currentPoints;
        const percentage = Math.min((currentPoints / 400) * 100, 100);
        progressFill.style.width = percentage + '%';
        
        // Update points remaining
        if (pointsRemainingElement) {
            const remaining = Math.max(400 - currentPoints, 0);
            pointsRemainingElement.textContent = remaining;
        }
        
        // Store in localStorage
        localStorage.setItem('currentPoints', currentPoints);
        
        // Check if we've reached 400 points
        if (currentPoints >= 400) {
            setTimeout(() => {
                showMessage('🎉 We\'ve reached 400 points! The drawing will be conducted soon with full media coverage.', 'success');
            }, 1000);
        }
    }
}

// Search Participants
function searchParticipants() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        searchResults.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">Please enter a name to search</p>';
        return;
    }
    
    const filteredParticipants = participants.filter(participant => 
        participant.name.toLowerCase().includes(searchTerm)
    );
    
    if (filteredParticipants.length === 0) {
        searchResults.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No participants found with that name</p>';
        return;
    }
    
    const resultsHtml = filteredParticipants.map(participant => `
        <div class="participant-result">
            <h4>${participant.name}</h4>
            <p><strong>Category:</strong> ${getCategoryDisplayName(participant.category)}</p>
            <p><strong>Points Registered:</strong> ${participant.points}</p>
            <p><strong>Certificate Number:</strong> ${participant.certificateNumber}</p>
            <p><strong>Registration Date:</strong> ${new Date(participant.registrationDate).toLocaleDateString()}</p>
            <p><strong>Transaction ID:</strong> ${participant.transactionId}</p>
        </div>
    `).join('');
    
    searchResults.innerHTML = resultsHtml;
}

function getCategoryDisplayName(category) {
    const categoryMap = {
        'agent-broker': 'Real Estate Agent/Broker',
        'developer': 'Developer',
        'sales-marketing': 'Sales & Marketing',
        'mortgage-broker': 'Mortgage Broker',
        'individual': 'Individual'
    };
    return categoryMap[category] || category;
}

// Search on Enter key
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchParticipants();
            }
        });
    }
    
    // Load real progress from API
    loadDrawingStatus();
});

// Load drawing status from backend API
async function loadDrawingStatus() {
    const currentPointsElement = document.getElementById('current-points');
    const progressFill = document.querySelector('.progress-fill');
    const pointsRemainingElement = document.getElementById('points-remaining');
    
    if (!currentPointsElement || !progressFill || !pointsRemainingElement) {
        return; // Elements not found on this page
    }
    
    try {
        const response = await fetch(`${API_URL}/public/stats`);
        const result = await response.json();
        
        if (result.success) {
            const { totalPoints, pointsUntilDraw, progress } = result.data;
            
            // Update the display
            currentPointsElement.textContent = totalPoints;
            progressFill.style.width = progress + '%';
            pointsRemainingElement.textContent = pointsUntilDraw;
        } else {
            console.warn('Failed to load drawing status');
            // Keep default hardcoded values
        }
    } catch (error) {
        console.error('Error loading drawing status:', error);
        // Keep default hardcoded values on error
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
}

// Format card number input
document.addEventListener('DOMContentLoaded', function() {
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) {
                formattedValue = formattedValue.substr(0, 19);
            }
            e.target.value = formattedValue;
        });
    }
    
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substr(0, 2) + '/' + value.substr(2, 2);
            }
            e.target.value = value;
        });
    }
    
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').substr(0, 4);
        });
    }
});

// Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.step, .group, .prize');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => {
        observer.observe(el);
    });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Demo data for testing (remove in production)
function addDemoParticipants() {
    const demoParticipants = [
        {
            name: "John Smith",
            email: "john.smith@email.com",
            phone: "+1-555-0101",
            category: "agent-broker",
            certificateNumber: "CERT-2025-001",
            points: 3,
            id: 1,
            registrationDate: new Date(Date.now() - 86400000).toISOString(),
            transactionId: "TXN-DEMO001"
        },
        {
            name: "Sarah Johnson",
            email: "sarah.j@email.com",
            phone: "+1-555-0102",
            category: "developer",
            certificateNumber: "CERT-2025-002",
            points: 2,
            id: 2,
            registrationDate: new Date(Date.now() - 172800000).toISOString(),
            transactionId: "TXN-DEMO002"
        },
        {
            name: "Mike Davis",
            email: "mike.davis@email.com",
            phone: "+1-555-0103",
            category: "mortgage-broker",
            certificateNumber: "CERT-2025-003",
            points: 1,
            id: 3,
            registrationDate: new Date().toISOString(),
            transactionId: "TXN-DEMO003"
        }
    ];
    
    // Only add demo data if no participants exist
    if (participants.length === 0) {
        participants = demoParticipants;
        localStorage.setItem('participants', JSON.stringify(participants));
        
        // Update progress with demo points
        const totalDemoPoints = demoParticipants.reduce((sum, p) => sum + p.points, 0);
        localStorage.setItem('currentPoints', 260 + totalDemoPoints); // Starting at 260 as shown in HTML
    }
}

// Animate Countdown with Flip Effect
function animateCountdown(element, startValue, targetValue, duration = 3000) {
    let currentValue = startValue;
    const decrement = (startValue - targetValue) / (duration / 100); // Update every 100ms for flip effect
    
    const timer = setInterval(() => {
        currentValue -= decrement;
        
        if (currentValue <= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        const newNumber = Math.ceil(currentValue);
        
        // Add flip animation class
        element.classList.add('flipping');
        
        // Change number during flip
        setTimeout(() => {
            element.textContent = newNumber;
        }, 300);
        
        // Remove flip class after animation
        setTimeout(() => {
            element.classList.remove('flipping');
        }, 600);
        
    }, 100); // Update every 100ms for visible flip effect
}

// Animated Counter Function
function animateCounter(element, target, duration = 2000, isPrice = false) {
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (isPrice) {
            element.textContent = Math.floor(current).toLocaleString();
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Animate Circular Progress
function animateCircularProgress(progressElement, targetProgress, duration = 2000) {
    const circle = document.getElementById('progress-circle');
    const progressNumber = document.querySelector('.progress-number');
    
    // Updated radius to match the SVG circle (60)
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // 376.99
    
    // Set initial state - start with full offset (empty circle)
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    
    let currentProgress = 0;
    const totalPoints = 400;
    const increment = targetProgress / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
        currentProgress += increment;
        
        if (currentProgress >= targetProgress) {
            currentProgress = targetProgress;
            clearInterval(timer);
        }
        
        // Calculate offset: full circumference minus progress portion
        // This makes it fill clockwise from the top
        const progressLength = (currentProgress / 100) * circumference;
        const offset = circumference - progressLength;
        circle.style.strokeDashoffset = `${offset}`;
        
        // Update the center number smoothly
        const currentPoints = Math.floor((currentProgress / 100) * totalPoints);
        progressNumber.textContent = currentPoints;
    }, 16);
}

// Initialize Hero Stats Animation
async function initHeroStatsAnimation() {
    const prizePoolCounter = document.getElementById('prize-pool-counter');
    const countdownCounter = document.getElementById('countdown-counter');
    const circularProgress = document.querySelector('.circular-progress');
    const progressPointsElement = document.getElementById('progress-points');
    
    if (prizePoolCounter && countdownCounter && circularProgress) {
        try {
            // Fetch real data from backend
            const response = await fetch(`${API_URL}/public/stats`);
            const result = await response.json();
            
            if (result.success) {
                const { totalPoints, pointsUntilDraw, progress, prizePool } = result.data;
                
                // Add intersection observer to trigger animation when in view
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Use real data for animations
                            setTimeout(() => animateCountdown(countdownCounter, 400, pointsUntilDraw, 3000), 100);  // Start countdown first
                            setTimeout(() => animateCounter(prizePoolCounter, prizePool, 3000, true), 400); // Prize pool second
                            setTimeout(() => animateCircularProgress(circularProgress, progress, 2500), 800);  // Progress circle last
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(document.querySelector('.hero-stats'));
            } else {
                // Fallback to default values if API fails
                console.warn('Failed to fetch stats, using default values');
                useDefaultStats();
            }
        } catch (error) {
            console.error('Error fetching global stats:', error);
            // Fallback to default values on error
            useDefaultStats();
        }
    }
    
    // Fallback function with default values
    function useDefaultStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => animateCountdown(countdownCounter, 400, 140, 3000), 100);
                    setTimeout(() => animateCounter(prizePoolCounter, 500000, 3000, true), 400);
                    setTimeout(() => animateCircularProgress(circularProgress, 35, 2500), 800);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(document.querySelector('.hero-stats'));
    }
}

// Initialize demo data
document.addEventListener('DOMContentLoaded', addDemoParticipants);
document.addEventListener('DOMContentLoaded', initHeroStatsAnimation);

// Step Cards Animation on Scroll
function initStepCardsAnimation() {
    const stepCards = document.querySelectorAll('.step-card');
    const stepArrows = document.querySelectorAll('.step-arrow');
    
    if (stepCards.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate step cards one by one
                stepCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 200); // 200ms delay between each card
                });
                
                // Animate arrows with delay after cards
                stepArrows.forEach((arrow, index) => {
                    setTimeout(() => {
                        arrow.classList.add('animate-in');
                    }, (index + 1) * 200 + 400); // Start after first card, with delays
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: window.innerWidth <= 768 ? 0.1 : 0.2,
        rootMargin: window.innerWidth <= 768 ? '0px 0px -20px 0px' : '0px 0px -50px 0px'
    });
    
    // Observe the steps container
    const stepsContainer = document.querySelector('.steps-container');
    if (stepsContainer) {
        observer.observe(stepsContainer);
    }
}

document.addEventListener('DOMContentLoaded', initStepCardsAnimation);

// Calculator Box Animation on Scroll  
function initCalculatorBoxAnimation() {
    const calculatorObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe calculator boxes
    const pointRules = document.querySelector('.point-rules');
    const calculatorTool = document.querySelector('.calculator-tool');
    
    if (pointRules) calculatorObserver.observe(pointRules);
    if (calculatorTool) calculatorObserver.observe(calculatorTool);
}

document.addEventListener('DOMContentLoaded', initCalculatorBoxAnimation);

// Trust Indicators Animation on Scroll
function initTrustIndicatorsAnimation() {
    const trustObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get all trust items within this trust-indicators container
                const trustItems = entry.target.querySelectorAll('.trust-item');
                trustItems.forEach((item) => {
                    item.classList.add('animate-in');
                });
                trustObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe the trust indicators container
    const trustIndicators = document.querySelector('.trust-indicators');
    if (trustIndicators) {
        trustObserver.observe(trustIndicators);
    }
}

document.addEventListener('DOMContentLoaded', initTrustIndicatorsAnimation);

// Prize Animation on Scroll
function initPrizeAnimation() {
    const prizes = document.querySelectorAll('.prize');
    
    const prizeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small delay to create staggered effect
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, 100);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });
    
    prizes.forEach(prize => {
        prizeObserver.observe(prize);
    });
}

document.addEventListener('DOMContentLoaded', initPrizeAnimation);

// Clean Mobile Navigation - Single Implementation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up mobile navigation...');
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('Elements found:', {
        hamburger: !!hamburger,
        navMenu: !!navMenu
    });
    
    if (hamburger && navMenu) {
        // Simple toggle function
        function toggleMobileMenu(e) {
            e.preventDefault();
            console.log('Toggling mobile menu');
            
            const isActive = hamburger.classList.contains('active');
            
            if (isActive) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('Menu closed');
            } else {
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                console.log('Menu opened');
            }
        }
        
        // Add click event
        hamburger.addEventListener('click', toggleMobileMenu);
        
        // Close menu when clicking nav links (except dropdown toggle)
        document.querySelectorAll('.nav-link').forEach(link => {
            if (!link.classList.contains('dropdown-toggle')) {
                link.addEventListener('click', function() {
                    console.log('Closing menu from nav link click');
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            }
        });
        
        // Handle dropdown toggle separately
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Dropdown toggle clicked - menu stays open');
                
                const dropdownMenu = document.querySelector('.dropdown-menu');
                const dropdown = document.querySelector('.dropdown');
                
                if (dropdownMenu && dropdown) {
                    const isOpen = dropdownMenu.style.display === 'block';
                    dropdownMenu.style.display = isOpen ? 'none' : 'block';
                    dropdown.classList.toggle('active', !isOpen);
                }
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        console.log('Mobile navigation setup complete');
    } else {
        console.error('Mobile navigation elements not found!');
    }
});

// Sketch Button Animation Functionality
const createSVG = (width, height, radius) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    svg.setAttributeNS("http://www.w3.org/2000/svg", "viewBox", `0 0 ${width} ${height}`);

    rectangle.setAttribute("x", "0");
    rectangle.setAttribute("y", "0");
    rectangle.setAttribute("width", "100%");
    rectangle.setAttribute("height", "100%");
    rectangle.setAttribute("rx", `${radius}`);
    rectangle.setAttribute("ry", `${radius}`);
    rectangle.setAttribute("pathLength", "10");

    svg.appendChild(rectangle);
    return svg;
};

// Initialize sketch buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".sketch-button").forEach((button) => {
        const style = getComputedStyle(button);
        const lines = document.createElement("div");
        lines.classList.add("lines");

        const groupTop = document.createElement("div");
        const groupBottom = document.createElement("div");

        const svg = createSVG(
            button.offsetWidth,
            button.offsetHeight,
            parseInt(style.borderRadius, 10)
        );

        groupTop.appendChild(svg);
        groupTop.appendChild(svg.cloneNode(true));
        groupTop.appendChild(svg.cloneNode(true));
        groupTop.appendChild(svg.cloneNode(true));

        groupBottom.appendChild(svg.cloneNode(true));
        groupBottom.appendChild(svg.cloneNode(true));
        groupBottom.appendChild(svg.cloneNode(true));
        groupBottom.appendChild(svg.cloneNode(true));

        lines.appendChild(groupTop);
        lines.appendChild(groupBottom);
        button.appendChild(lines);

        button.addEventListener("pointerenter", () => {
            button.classList.add("start");
        });

        svg.addEventListener("animationend", () => {
            button.classList.remove("start");
        });
    });
    
    // Trust Indicators Slide Animation
    const GRID_CELLS = [...document.querySelectorAll(".grid__cell")];
    
    const gridCellHover = function(e) {
        const { clientX: x, clientY: y } = e;
        const GRID_CELL_HOVER = this.querySelector(".hover-block");
        const GC_RECT = this.getBoundingClientRect();
        
        // Get center of the box
        const centerX = GC_RECT.left + GC_RECT.width / 2;
        const centerY = GC_RECT.top + GC_RECT.height / 2;
        
        // Calculate angle from center to mouse position
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // Determine direction based on angle
        if (angle >= -45 && angle < 45) {
            GRID_CELL_HOVER.setAttribute("data-slide", "right");
        } else if (angle >= 45 && angle < 135) {
            GRID_CELL_HOVER.setAttribute("data-slide", "bottom");
        } else if (angle >= 135 || angle < -135) {
            GRID_CELL_HOVER.setAttribute("data-slide", "left");
        } else {
            GRID_CELL_HOVER.setAttribute("data-slide", "top");
        }
    };

    const gridCellHoverLeave = function(e) {
        const { clientX: x, clientY: y } = e;
        const GRID_CELL_HOVER = this.querySelector(".hover-block");
        const GC_RECT = this.getBoundingClientRect();
        
        // Get center of the box
        const centerX = GC_RECT.left + GC_RECT.width / 2;
        const centerY = GC_RECT.top + GC_RECT.height / 2;
        
        // Calculate angle from center to mouse position
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // Determine direction based on angle
        if (angle >= -45 && angle < 45) {
            GRID_CELL_HOVER.setAttribute("data-slide", "right-out");
        } else if (angle >= 45 && angle < 135) {
            GRID_CELL_HOVER.setAttribute("data-slide", "bottom-out");
        } else if (angle >= 135 || angle < -135) {
            GRID_CELL_HOVER.setAttribute("data-slide", "left-out");
        } else {
            GRID_CELL_HOVER.setAttribute("data-slide", "top-out");
        }
    };

    GRID_CELLS.forEach(cell => cell.addEventListener("mouseenter", gridCellHover));
    GRID_CELLS.forEach(cell => cell.addEventListener("mouseleave", gridCellHoverLeave));
});

// User Session Management Functions
function getCurrentUser() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const sessionData = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!sessionData) return null;
    
    try {
        const session = JSON.parse(sessionData);
        const user = users.find(u => u.id === session.userId);
        return user || null;
    } catch (error) {
        console.error('Error parsing session data:', error);
        return null;
    }
}

function updateDashboardLink() {
    // Find all dashboard links in the dropdown
    const dashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');
    const user = getCurrentUser();
    
    if (user && user.isAdmin) {
        // Update all dashboard links to point to admin dashboard
        dashboardLinks.forEach(link => {
            link.href = 'admin.html';
            console.log('Updated dashboard link for admin user');
        });
    } else {
        // Make sure links point to regular dashboard
        dashboardLinks.forEach(link => {
            link.href = 'dashboard.html';
            console.log('Dashboard link set for regular user');
        });
    }
}

// How It Works Page - About Section Animations
function initAboutDeedDrawAnimations() {
    // About content blocks animation
    const aboutContentBlocks = document.querySelectorAll('.about-content-block');
    const statsUnifiedBox = document.querySelector('.stats-unified-box');
    const statItems = document.querySelectorAll('.stat-item');

    if (aboutContentBlocks.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        aboutContentBlocks.forEach(block => observer.observe(block));
    }

    // Stats unified box animation
    if (statsUnifiedBox) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate the box first
                    entry.target.classList.add('animate-in');
                    
                    // Then animate the stat items inside with delay
                    setTimeout(() => {
                        statItems.forEach(item => {
                            item.classList.add('animate-in');
                        });
                    }, 200);
                    
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsUnifiedBox);
    }
}

// How It Works Page - Getting Started Guide Animations
function initGettingStartedGuideAnimations() {
    const guideSteps = document.querySelectorAll('.hiw-guide-step');

    if (guideSteps.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        guideSteps.forEach(step => observer.observe(step));
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', initAboutDeedDrawAnimations);
document.addEventListener('DOMContentLoaded', initGettingStartedGuideAnimations);
document.addEventListener('DOMContentLoaded', loadLeaderboard);

// Load Leaderboard from API
async function loadLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    
    if (!leaderboardBody) {
        return; // Element not found on this page
    }
    
    try {
        const response = await fetch(`${API_URL}/public/leaderboard`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            displayLeaderboard(result.data);
        } else {
            leaderboardBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: #cbd5e1;">No participants yet. Be the first to register!</div>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        leaderboardBody.innerHTML = '<div style="padding: 2rem; text-align: center; color: #cbd5e1;">Unable to load leaderboard</div>';
    }
}

function displayLeaderboard(participants) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;
    
    const categoryMap = {
        'agent-broker': 'Real Estate Agent/Broker',
        'developer': 'Developer',
        'sales-marketing': 'Sales & Marketing',
        'mortgage-broker': 'Mortgage Broker'
    };
    
    const leaderboardHTML = participants.map((participant, index) => {
        const rank = index + 1;
        const nameParts = participant.name.split(' ');
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
        const categoryDisplay = categoryMap[participant.category] || participant.category;
        
        return `
            <div class="leaderboard-row">
                <span class="rank">${rank}</span>
                <div class="participant-info">
                    <div class="participant-avatar">${initials}</div>
                    <div class="participant-details">
                        <span class="participant-name">${participant.name}</span>
                        <span class="participant-meta">${categoryDisplay}</span>
                    </div>
                </div>
                <span class="participant-location">${participant.location}</span>
                <span class="tickets">${participant.points}</span>
            </div>
        `;
    }).join('');
    
    leaderboardBody.innerHTML = leaderboardHTML;
}

// Load Drawing Status for Prizes Page
document.addEventListener('DOMContentLoaded', loadPrizesDrawingStatus);

async function loadPrizesDrawingStatus() {
    const currentPointsElement = document.getElementById('prizes-current-points');
    const progressFillElement = document.getElementById('prizes-progress-fill');
    const progressPercentageElement = document.getElementById('prizes-progress-percentage');
    const participantsElement = document.getElementById('prizes-participants');
    const pointsNeededElement = document.getElementById('prizes-points-needed');
    
    if (!currentPointsElement || !progressFillElement || !progressPercentageElement) {
        return; // Elements not found on this page
    }
    
    try {
        const response = await fetch(`${API_URL}/public/stats`);
        const result = await response.json();
        
        if (result.success) {
            const { totalPoints, progress, participants, pointsUntilDraw } = result.data;
            
            console.log('Prizes page - Loading stats:', { totalPoints, progress, participants, pointsUntilDraw });
            
            // Update status cards if elements exist
            if (participantsElement) {
                participantsElement.textContent = participants;
            }
            if (pointsNeededElement) {
                pointsNeededElement.textContent = pointsUntilDraw;
            }
            
            // Add small delay to ensure page is fully loaded
            setTimeout(() => {
                animatePrizesProgress(totalPoints, progress);
            }, 100);
        } else {
            console.warn('Failed to load drawing status for prizes page');
        }
    } catch (error) {
        console.error('Error loading prizes drawing status:', error);
    }
}

function animatePrizesProgress(targetPoints, targetProgress) {
    const currentPointsElement = document.getElementById('prizes-current-points');
    const progressFillElement = document.getElementById('prizes-progress-fill');
    const progressPercentageElement = document.getElementById('prizes-progress-percentage');
    
    if (!currentPointsElement || !progressFillElement || !progressPercentageElement) return;
    
    console.log('Starting animation:', { targetPoints, targetProgress });
    
    let currentPoints = 0;
    let currentProgress = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const pointsIncrement = targetPoints / steps;
    const progressIncrement = targetProgress / steps;
    const interval = duration / steps;
    
    const timer = setInterval(() => {
        currentPoints += pointsIncrement;
        currentProgress += progressIncrement;
        
        if (currentPoints >= targetPoints) {
            currentPoints = targetPoints;
            currentProgress = targetProgress;
            clearInterval(timer);
            console.log('Animation complete:', { currentPoints, currentProgress });
        }
        
        // Update elements
        currentPointsElement.textContent = Math.round(currentPoints);
        progressFillElement.style.width = currentProgress + '%';
        
        // Always show 2 decimal places, even if it's 0.00
        const percentageText = currentProgress.toFixed(2) + '%';
        progressPercentageElement.textContent = percentageText;
        
        progressFillElement.setAttribute('data-target-width', currentProgress);
        progressPercentageElement.setAttribute('data-target-percentage', currentProgress);
        
        console.log('Updating:', { currentPoints: Math.round(currentPoints), currentProgress: currentProgress.toFixed(2), percentageText });
    }, interval);
}

// Live Participant Search
let searchTimeout;
const participantSearchInput = document.getElementById('participant-search');
const searchResultsContainer = document.getElementById('search-results');

if (participantSearchInput && searchResultsContainer) {
    participantSearchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        clearTimeout(searchTimeout);
        
        // If query is less than 2 characters, clear results
        if (query.length < 2) {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
            return;
        }
        
        // Debounce the search - wait 300ms after user stops typing
        searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/public/search-participants?query=${encodeURIComponent(query)}`);
                const result = await response.json();
                
                if (result.success) {
                    displaySearchResults(result.data);
                } else {
                    searchResultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: #64748b;">Error loading results</p>';
                    searchResultsContainer.style.display = 'block';
                }
            } catch (error) {
                console.error('Error searching participants:', error);
                searchResultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: #64748b;">Error loading results</p>';
                searchResultsContainer.style.display = 'block';
            }
        }, 300);
    });
}

function displaySearchResults(participants) {
    if (!searchResultsContainer) return;
    
    if (participants.length === 0) {
        searchResultsContainer.innerHTML = '<p style="padding: 1rem; text-align: center; color: #64748b;">No participants found</p>';
        searchResultsContainer.style.display = 'block';
        return;
    }
    
    const resultsHTML = participants.map(participant => {
        // Get initials for avatar
        const nameParts = participant.name.split(' ');
        const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
        
        // Format category display
        const categoryMap = {
            'agent-broker': 'Real Estate Agent/Broker',
            'developer': 'Developer',
            'sales-marketing': 'Sales & Marketing',
            'mortgage-broker': 'Mortgage Broker'
        };
        const categoryDisplay = categoryMap[participant.category] || participant.category;
        
        return `
            <div class="search-result-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(226, 232, 240, 0.3); transition: background 0.3s ease;">
                <div class="participant-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #F59E0B, #D97706); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.9rem; margin-right: 1rem; flex-shrink: 0;">
                    ${initials}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: #ffffff; margin-bottom: 0.25rem;">${participant.name}</div>
                    <div style="font-size: 0.85rem; color: #cbd5e1;">${categoryDisplay}</div>
                </div>
                <div style="text-align: right; margin-left: 1rem;">
                    <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.25rem;">${participant.location}</div>
                    <div style="font-weight: 600; color: #F59E0B;">${participant.points} points</div>
                </div>
            </div>
        `;
    }).join('');
    
    searchResultsContainer.innerHTML = resultsHTML;
    searchResultsContainer.style.display = 'block';
    
    // Add hover effect to result items
    const resultItems = searchResultsContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(245, 158, 11, 0.1)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
        });
    });
}
