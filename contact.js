// Contact page scroll animations
document.addEventListener('DOMContentLoaded', function() {
    // Add scroll-animate class to elements that should animate
    const leaderProfileCard = document.querySelector('.leader-profile-card');
    const leaderContactItems = document.querySelectorAll('.leader-contact-item');
    
    if (leaderProfileCard) {
        leaderProfileCard.classList.add('scroll-animate');
    }
    
    leaderContactItems.forEach(item => {
        item.classList.add('scroll-animate');
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe the leader profile card
    if (leaderProfileCard) {
        observer.observe(leaderProfileCard);
    }
    
    // Observe each contact item
    leaderContactItems.forEach(item => {
        observer.observe(item);
    });
    
    // Add animation to leader image specifically
    const leaderImage = document.querySelector('.leader-image');
    if (leaderImage) {
        leaderImage.style.transition = 'all 0.8s ease';
        leaderImage.style.transform = 'scale(0.9)';
        leaderImage.style.opacity = '0.8';
        
        // Animate when profile card comes into view
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    leaderImage.style.transform = 'scale(1)';
                    leaderImage.style.opacity = '1';
                }
            });
        }, observerOptions);
        
        if (leaderProfileCard) {
            imageObserver.observe(leaderProfileCard);
        }
    }
    
    // Contact Information Section Animations
    const contactInfoCards = document.querySelectorAll('.contact-info-card');
    const contactFormCard = document.querySelector('.contact-form-card');
    const mapWrapper = document.querySelector('.map-wrapper');
    const mapInfoCard = document.querySelector('.map-info-card');
    
    // Add scroll-animate class to contact info elements
    contactInfoCards.forEach(card => {
        card.classList.add('scroll-animate');
        observer.observe(card);
    });
    
    if (contactFormCard) {
        contactFormCard.classList.add('scroll-animate');
        observer.observe(contactFormCard);
    }
    
    if (mapWrapper) {
        mapWrapper.classList.add('scroll-animate');
        observer.observe(mapWrapper);
    }
    
    if (mapInfoCard) {
        mapInfoCard.classList.add('scroll-animate');
        observer.observe(mapInfoCard);
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Validate
            if (!name || !email || !subject || !message) {
                showContactMessage('Please fill in all fields', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showContactMessage('Please enter a valid email address', 'error');
                return;
            }

            // Add loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('https://www.deeddraw.com/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        subject,
                        message
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showContactMessage(data.message || 'Message sent successfully!', 'success');
                    contactForm.reset();
                } else {
                    showContactMessage(data.message || 'Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Contact form error:', error);
                showContactMessage('Unable to connect to server. Please try again later.', 'error');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});

// Show message function for contact form
function showContactMessage(text, type = 'success') {
    const existingMessage = document.querySelector('.contact-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${text}</span>
    `;

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.insertAdjacentElement('beforebegin', messageDiv);

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Remove after 5 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }
}