// EdgeMarket Trading Platform - Advanced Animations

class AnimationController {
    constructor() {
        this.init();
        this.bindEvents();
    }

    init() {
        this.initializeAOS();
        this.initializeGSAP();
        this.initializeScrollTrigger();
        this.initializeMorphingShapes();
        this.initializeTypewriter();
        this.initializeChartAnimations();
    }

    bindEvents() {
        // Scroll-based animations
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));

        // Mouse movement parallax
        document.addEventListener('mousemove', this.throttle(this.handleMouseMove.bind(this), 16));

        // Page load animations
        window.addEventListener('load', this.handlePageLoad.bind(this));

        // Resize handling
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    initializeAOS() {
        // AOS-like functionality without the library
        const elements = document.querySelectorAll('[data-aos]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.aos;
                    const delay = element.dataset.aosDelay || 0;
                    const duration = element.dataset.aosDuration || 600;

                    setTimeout(() => {
                        element.classList.add('aos-animate');
                        this.animateElement(element, animation, duration);
                    }, delay);

                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => {
            observer.observe(el);
        });
    }

    initializeGSAP() {
        // GSAP-like timeline animations without the library
        this.createHeroAnimation();
        this.createFeatureCardAnimations();
        this.createStatsAnimation();
        this.createFloatingElements();
    }

    createHeroAnimation() {
        const heroTitle = document.querySelector('.hero-title');
        const heroDescription = document.querySelector('.hero-description');
        const heroButtons = document.querySelector('.hero-buttons');
        const heroStats = document.querySelector('.hero-stats');
        const heroVisual = document.querySelector('.hero-visual');

        if (!heroTitle) return;

        // Stagger animation for hero elements
        const elements = [heroTitle, heroDescription, heroButtons, heroStats];

        elements.forEach((element, index) => {
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(50px)';
                element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 200 + (index * 150));
            }
        });

        // Animate hero visual with a different timing
        if (heroVisual) {
            heroVisual.style.opacity = '0';
            heroVisual.style.transform = 'scale(0.8) translateY(30px)';
            heroVisual.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

            setTimeout(() => {
                heroVisual.style.opacity = '1';
                heroVisual.style.transform = 'scale(1) translateY(0)';
            }, 600);
        }
    }

    createFeatureCardAnimations() {
        const featureCards = document.querySelectorAll('.feature-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = Array.from(featureCards).indexOf(card);

                    card.style.opacity = '0';
                    card.style.transform = 'translateY(50px) scale(0.9)';
                    card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, index * 100);

                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.2 });

        featureCards.forEach(card => {
            observer.observe(card);
        });
    }

    createStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseInt(stat.dataset.target);

                    this.animateCounter(stat, 0, target, 2000);
                    observer.unobserve(stat);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    createFloatingElements() {
        const floatingElements = document.querySelectorAll('.floating-animation, .floating-delayed');

        floatingElements.forEach(element => {
            this.createFloatingAnimation(element);
        });
    }

    createFloatingAnimation(element) {
        let startTime = performance.now();
        const duration = 6000; // 6 seconds
        const amplitude = 20; // 20px movement

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = (elapsed % duration) / duration;
            const yOffset = Math.sin(progress * Math.PI * 2) * amplitude;

            element.style.transform = `translateY(${yOffset}px)`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    initializeScrollTrigger() {
        // Parallax scrolling effects
        const parallaxElements = document.querySelectorAll('.parallax');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });

        // Navbar color change on scroll
        const navbar = document.getElementById('navbar');
        const heroSection = document.querySelector('.hero-section');

        if (navbar && heroSection) {
            window.addEventListener('scroll', () => {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

                if (window.scrollY > heroBottom - 100) {
                    navbar.classList.add('scrolled-past-hero');
                } else {
                    navbar.classList.remove('scrolled-past-hero');
                }
            });
        }
    }

    initializeMorphingShapes() {
        // Create animated SVG shapes
        const shapesContainer = document.createElement('div');
        shapesContainer.className = 'morphing-shapes';
        shapesContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        `;

        document.body.appendChild(shapesContainer);

        // Create animated shapes
        for (let i = 0; i < 5; i++) {
            this.createMorphingShape(shapesContainer, i);
        }
    }

    createMorphingShape(container, index) {
        const shape = document.createElement('div');
        shape.className = 'morphing-shape';

        const size = Math.random() * 200 + 100;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        shape.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: linear-gradient(45deg, #3b82f6, #10b981);
            border-radius: 50% 30% 70% 40%;
            animation: morphing ${10 + index * 2}s ease-in-out infinite;
        `;

        container.appendChild(shape);
    }

    initializeTypewriter() {
        const typewriterElements = document.querySelectorAll('.typewriter');

        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid currentColor';

            let i = 0;
            const typeSpeed = 100;

            const typeWriter = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, typeSpeed);
                } else {
                    // Blinking cursor animation
                    setInterval(() => {
                        element.style.borderRight = element.style.borderRight === '2px solid transparent' 
                            ? '2px solid currentColor' 
                            : '2px solid transparent';
                    }, 500);
                }
            };

            // Start typing when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(typeWriter, 500);
                        observer.unobserve(element);
                    }
                });
            });

            observer.observe(element);
        });
    }

    initializeChartAnimations() {
        // Animated trading charts
        const chartElements = document.querySelectorAll('.animated-chart');

        chartElements.forEach(chart => {
            this.createAnimatedChart(chart);
        });
    }

    createAnimatedChart(container) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        container.appendChild(canvas);

        // Generate sample data
        const dataPoints = 50;
        const data = [];
        let value = 100;

        for (let i = 0; i < dataPoints; i++) {
            value += (Math.random() - 0.5) * 10;
            data.push(value);
        }

        let animationProgress = 0;
        const animationDuration = 2000;

        const animate = (timestamp) => {
            if (!this.startTime) this.startTime = timestamp;
            const elapsed = timestamp - this.startTime;
            animationProgress = Math.min(elapsed / animationDuration, 1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawChart(ctx, data, animationProgress, canvas.width, canvas.height);

            if (animationProgress < 1) {
                requestAnimationFrame(animate);
            }
        };

        // Start animation when chart is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(animate);
                    observer.unobserve(container);
                }
            });
        });

        observer.observe(container);
    }

    drawChart(ctx, data, progress, width, height) {
        const pointsToShow = Math.floor(data.length * progress);
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const range = maxValue - minValue;

        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i <= pointsToShow; i++) {
            const x = (i / (data.length - 1)) * width;
            const y = height - (((data[i] - minValue) / range) * height);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Add glow effect
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.stroke();
    }

    animateElement(element, animation, duration) {
        const animations = {
            'fade-up': () => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            },
            'fade-down': () => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(-30px)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            },
            'fade-left': () => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(-30px)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                });
            },
            'fade-right': () => {
                element.style.opacity = '0';
                element.style.transform = 'translateX(30px)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateX(0)';
                });
            },
            'zoom-in': () => {
                element.style.opacity = '0';
                element.style.transform = 'scale(0.8)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'scale(1)';
                });
            },
            'flip-up': () => {
                element.style.opacity = '0';
                element.style.transform = 'perspective(2500px) rotateX(-100deg)';
                element.style.transition = `all ${duration}ms ease-out`;

                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'perspective(2500px) rotateX(0deg)';
                });
            }
        };

        if (animations[animation]) {
            animations[animation]();
        }
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const range = end - start;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = this.easeOutQuart(progress);
            const currentValue = Math.floor(start + (range * easedProgress));

            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    handleScroll() {
        const scrollY = window.pageYOffset;

        // Update parallax elements
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        // Update progress indicators
        const progressElements = document.querySelectorAll('.scroll-progress');
        progressElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, 1 - (rect.top / window.innerHeight)));
            element.style.setProperty('--progress', progress);
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Mouse parallax for floating elements
        const floatingElements = document.querySelectorAll('.mouse-parallax');
        floatingElements.forEach(element => {
            const speed = element.dataset.speed || 0.1;
            const x = (mouseX - centerX) * speed;
            const y = (mouseY - centerY) * speed;

            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    handlePageLoad() {
        // Trigger page entrance animations
        document.body.classList.add('page-loaded');

        // Start any autoplay animations
        const autoplayElements = document.querySelectorAll('.auto-animate');
        autoplayElements.forEach(element => {
            this.startAutoAnimation(element);
        });
    }

    handleResize() {
        // Update canvas sizes
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        });

        // Update particle system
        this.updateParticleSystem();
    }

    startAutoAnimation(element) {
        const animationType = element.dataset.animation || 'pulse';
        const duration = element.dataset.duration || 2000;
        const delay = element.dataset.delay || 0;

        setTimeout(() => {
            element.classList.add(`animate-${animationType}`);
        }, delay);
    }

    updateParticleSystem() {
        // Update particle positions and boundaries
        const particles = document.querySelectorAll('.particle');
        particles.forEach(particle => {
            const rect = particle.getBoundingClientRect();
            if (rect.left > window.innerWidth || rect.top > window.innerHeight) {
                particle.remove();
            }
        });
    }

    // Easing functions
    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;

        return t === 0
            ? 0
            : t === 1
            ? 1
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add morphing keyframes to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes morphing {
        0%, 100% {
            border-radius: 50% 30% 70% 40%;
            transform: rotate(0deg) scale(1);
        }
        25% {
            border-radius: 30% 70% 40% 50%;
            transform: rotate(90deg) scale(1.1);
        }
        50% {
            border-radius: 70% 40% 50% 30%;
            transform: rotate(180deg) scale(0.9);
        }
        75% {
            border-radius: 40% 50% 30% 70%;
            transform: rotate(270deg) scale(1.05);
        }
    }

    .aos-animate {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .page-loaded .page-enter {
        animation: fadeInUp 0.8s ease-out;
    }

    .paused * {
        animation-play-state: paused !important;
    }
`;
document.head.appendChild(style);

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    new AnimationController();
});
// Scroll animations and number counters
document.addEventListener('DOMContentLoaded', function() {
    // Counter animation for statistics
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const increment = target / 200;
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    if (target >= 1000) {
                        counter.textContent = Math.floor(current).toLocaleString();
                    } else {
                        counter.textContent = current.toFixed(1);
                    }
                    requestAnimationFrame(updateCounter);
                } else {
                    if (target >= 1000) {
                        counter.textContent = target.toLocaleString();
                    } else {
                        counter.textContent = target.toString();
                    }
                }
            };

            updateCounter();
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stat-number')) {
                    animateCounters();
                }
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.addEventListener('DOMContentLoaded', function() {
        // Add animation classes to elements
        const animatedElements = document.querySelectorAll(
            '.fade-in-up, .hover-lift, .floating-animation, .floating-delayed, [data-aos]'
        );

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

        // Observe stat numbers for counter animation
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        statNumbers.forEach(stat => {
            animationObserver.observe(stat);
        });
    });
});

// Add CSS for animations
const animationStyles = `
    .animate {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }

    .fade-in-up {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }

    .navbar.scrolled {
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .navbar.hidden {
        transform: translateY(-100%);
    }

    .navbar {
        transition: all 0.3s ease;
    }

    .hover-lift {
        transition: transform 0.3s ease;
    }

    .hover-lift:hover {
        transform: translateY(-10px);
    }

    .floating-animation {
        animation: float 6s ease-in-out infinite;
    }

    .floating-delayed {
        animation: float 6s ease-in-out infinite;
        animation-delay: 2s;
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-20px);
        }
    }

    .pulse-animation {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
        100% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(animationStyles);