// Main JavaScript functionality for EdgeMarket landing page
document.addEventListener('DOMContentLoaded', function() {

    // Add ripple effect CSS if not already present
    if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .ripple-effect {
                position: relative;
                overflow: hidden;
            }
            .navbar.scroll-down {
                transform: translateY(-100%);
            }
            .navbar.scroll-up {
                transform: translateY(0);
            }
            img {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            img.loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    // Ripple effect for buttons
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.className = 'ripple';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });

    // Smooth reveal animations on scroll
    const revealElements = document.querySelectorAll('.fade-in-up, [data-aos]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // Navigation scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    const handleScroll = () => {
        const currentScroll = window.pageYOffset;

        if (navbar) {
            if (currentScroll <= 0) {
                navbar.classList.remove('scroll-up');
                return;
            }

            if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-up');
                navbar.classList.add('scroll-down');
            } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
                navbar.classList.remove('scroll-down');
                navbar.classList.add('scroll-up');
            }
        }
        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);

    // Add dynamic loading states for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('load', function() {
            this.classList.add('loaded');
        });

        // If image is already loaded
        if (img.complete) {
            img.classList.add('loaded');
        }
    });

    // Counter animation
    const animateCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (isNaN(target)) return;

            const duration = 2000; // 2 seconds
            const steps = 60;
            const stepValue = target / steps;
            const stepTime = duration / steps;

            let current = 0;
            const timer = setInterval(() => {
                current += stepValue;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, stepTime);
        });
    };

    // Run counter animation
    animateCounters();

    // Smooth scrolling for anchor links
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

    // Initialize particles if the container exists
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer && typeof initParticles === 'function') {
        initParticles();
    }

    console.log('EdgeMarket landing page initialized successfully');
});