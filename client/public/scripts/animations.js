// Animation utilities for EdgeMarket landing page
document.addEventListener('DOMContentLoaded', function() {

    // Floating animation for hero elements
    const floatingElements = document.querySelectorAll('.floating-animation, .floating-delayed');
    floatingElements.forEach((element, index) => {
        element.style.animation = `floating 3s ease-in-out infinite ${index * 0.5}s`;
    });

    // Pulse animation for logos
    const pulseElements = document.querySelectorAll('.pulse-animation');
    pulseElements.forEach(element => {
        element.style.animation = 'pulse 2s infinite';
    });

    // Hover lift effect
    const hoverElements = document.querySelectorAll('.hover-lift');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.transition = 'transform 0.3s ease';
        });

        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Gradient text animation
    const gradientTexts = document.querySelectorAll('.gradient-text');
    gradientTexts.forEach(text => {
        text.style.backgroundSize = '200% auto';
        text.style.animation = 'gradient-shift 3s ease-in-out infinite';
    });

    // Add necessary CSS animations if they don't exist
    if (!document.getElementById('dynamic-animations')) {
        const animationStyle = document.createElement('style');
        animationStyle.id = 'dynamic-animations';
        animationStyle.textContent = `
            @keyframes floating {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            .floating-animation {
                animation: floating 3s ease-in-out infinite;
            }

            .floating-delayed {
                animation: floating 3s ease-in-out infinite 0.5s;
            }

            .pulse-animation {
                animation: pulse 2s infinite;
            }
        `;
        document.head.appendChild(animationStyle);
    }

    console.log('Animations initialized successfully');
});