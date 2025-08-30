
// Floating particles animation
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.particleCount = 50;
        this.init();
    }

    init() {
        const container = document.getElementById('particles');
        if (!container) return;

        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle(container);
        }

        this.animate();
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const opacity = Math.random() * 0.6 + 0.2;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(59, 130, 246, ${opacity});
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${duration}s infinite ease-in-out ${delay}s;
        `;
        
        container.appendChild(particle);
        this.particles.push(particle);
    }

    animate() {
        // Additional particle effects can be added here
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});

// CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    }

    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
        }
        25% {
            transform: translateY(-30px) rotate(90deg);
            opacity: 0.8;
        }
        50% {
            transform: translateY(-60px) rotate(180deg);
            opacity: 0.4;
        }
        75% {
            transform: translateY(-30px) rotate(270deg);
            opacity: 0.6;
        }
    }
`;
document.head.appendChild(style);
