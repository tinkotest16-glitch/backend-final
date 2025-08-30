// EdgeMarket Trading Platform - Particle System

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.maxParticles = 50;
        this.animationId = null;
        this.isActive = true;
        
        this.init();
        this.animate();
        this.bindEvents();
    }

    init() {
        this.createParticles();
    }

    bindEvents() {
        // Pause particles when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Update on resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Mouse interaction
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }

    createParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.3,
            color: this.getRandomColor(),
            angle: Math.random() * Math.PI * 2,
            life: 1.0,
            decay: Math.random() * 0.01 + 0.005,
            element: null
        };

        // Create DOM element
        particle.element = this.createParticleElement(particle);
        this.container.appendChild(particle.element);
        
        this.particles.push(particle);
        return particle;
    }

    createParticleElement(particle) {
        const element = document.createElement('div');
        element.className = 'particle';
        element.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: ${particle.color};
            border-radius: 50%;
            pointer-events: none;
            opacity: ${particle.opacity};
            transform: translate(${particle.x}px, ${particle.y}px);
            transition: transform 0.1s linear;
            box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
        `;
        return element;
    }

    getRandomColor() {
        const colors = [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(16, 185, 129, 0.8)',   // Green
            'rgba(139, 92, 246, 0.8)',   // Purple
            'rgba(245, 158, 11, 0.8)',   // Orange
            'rgba(239, 68, 68, 0.8)',    // Red
            'rgba(6, 182, 212, 0.8)',    // Cyan
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateParticle(particle) {
        // Move particle upward
        particle.y -= particle.speed;
        
        // Add floating motion
        particle.x += Math.sin(particle.angle) * 0.5;
        particle.angle += 0.02;
        
        // Update life
        particle.life -= particle.decay;
        particle.opacity = particle.life * 0.8;

        // Update DOM element
        if (particle.element) {
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
            particle.element.style.opacity = particle.opacity;
        }

        // Remove if out of bounds or dead
        if (particle.y < -50 || particle.life <= 0 || particle.x < -50 || particle.x > window.innerWidth + 50) {
            this.removeParticle(particle);
            return false;
        }
        
        return true;
    }

    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        }
    }

    animate() {
        if (!this.isActive) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => this.updateParticle(particle));

        // Add new particles if needed
        if (this.particles.length < this.maxParticles && Math.random() < 0.3) {
            this.createParticle();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Create particles near mouse
        if (Math.random() < 0.1) {
            const particle = {
                x: mouseX + (Math.random() - 0.5) * 100,
                y: mouseY + (Math.random() - 0.5) * 100,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                opacity: Math.random() * 0.3 + 0.2,
                color: this.getRandomColor(),
                angle: Math.random() * Math.PI * 2,
                life: 0.5,
                decay: 0.01,
                element: null
            };

            particle.element = this.createParticleElement(particle);
            this.container.appendChild(particle.element);
            this.particles.push(particle);
        }

        // Attract nearby particles to mouse
        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.x += dx * force * 0.01;
                particle.y += dy * force * 0.01;
            }
        });
    }

    handleResize() {
        // Remove particles that are now out of bounds
        this.particles = this.particles.filter(particle => {
            if (particle.x > window.innerWidth + 50) {
                this.removeParticle(particle);
                return false;
            }
            return true;
        });
    }

    pause() {
        this.isActive = false;
        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.style.animationPlayState = 'paused';
            }
        });
    }

    resume() {
        this.isActive = true;
        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.style.animationPlayState = 'running';
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.particles = [];
    }
}

// Enhanced Trading Chart Particle Effect
class TradingChartParticles {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.dataPoints = [];
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            opacity: 0.8;
        `;
        
        this.container.appendChild(this.canvas);
        this.generateDataPoints();
        this.createTrailParticles();
        this.animate();
    }

    generateDataPoints() {
        const pointCount = 50;
        let value = 100;
        
        for (let i = 0; i < pointCount; i++) {
            value += (Math.random() - 0.5) * 8;
            this.dataPoints.push({
                x: (i / (pointCount - 1)) * this.canvas.width,
                y: this.canvas.height - ((value / 200) * this.canvas.height),
                value: value
            });
        }
    }

    createTrailParticles() {
        for (let i = 0; i < this.dataPoints.length - 1; i++) {
            const point1 = this.dataPoints[i];
            const point2 = this.dataPoints[i + 1];
            
            // Create particles along the line
            const distance = Math.sqrt(
                Math.pow(point2.x - point1.x, 2) + 
                Math.pow(point2.y - point1.y, 2)
            );
            
            const particleCount = Math.floor(distance / 10);
            
            for (let j = 0; j < particleCount; j++) {
                const progress = j / particleCount;
                const x = point1.x + (point2.x - point1.x) * progress;
                const y = point1.y + (point2.y - point1.y) * progress;
                
                this.particles.push({
                    x: x,
                    y: y,
                    originalX: x,
                    originalY: y,
                    size: Math.random() * 2 + 1,
                    life: 1.0,
                    decay: Math.random() * 0.01 + 0.005,
                    color: point2.value > point1.value ? '#10b981' : '#ef4444',
                    alpha: Math.random() * 0.5 + 0.3,
                    velocityX: (Math.random() - 0.5) * 0.5,
                    velocityY: (Math.random() - 0.5) * 0.5,
                    delay: i * 50 + j * 10
                });
            }
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            if (particle.delay > 0) {
                particle.delay--;
                return true;
            }

            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life -= particle.decay;
            particle.alpha = particle.life * 0.8;

            return particle.life > 0;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            if (particle.delay <= 0) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = particle.size * 2;
                
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.restore();
            }
        });
        
        // Draw connecting lines
        this.drawChartLine();
    }

    drawChartLine() {
        if (this.dataPoints.length < 2) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#3b82f6';
        this.ctx.shadowBlur = 5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.dataPoints[0].x, this.dataPoints[0].y);
        
        for (let i = 1; i < this.dataPoints.length; i++) {
            this.ctx.lineTo(this.dataPoints[i].x, this.dataPoints[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        
        // Add new particles occasionally
        if (Math.random() < 0.1 && this.particles.length < 200) {
            const randomPoint = this.dataPoints[Math.floor(Math.random() * this.dataPoints.length)];
            this.particles.push({
                x: randomPoint.x + (Math.random() - 0.5) * 20,
                y: randomPoint.y + (Math.random() - 0.5) * 20,
                originalX: randomPoint.x,
                originalY: randomPoint.y,
                size: Math.random() * 2 + 1,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                color: '#3b82f6',
                alpha: Math.random() * 0.3 + 0.2,
                velocityX: (Math.random() - 0.5) * 1,
                velocityY: (Math.random() - 0.5) * 1,
                delay: 0
            });
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// DNA Helix Particle Effect
class DNAHelixParticles {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.time = 0;
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            opacity: 0.6;
        `;
        
        this.container.appendChild(this.canvas);
        this.createHelixParticles();
        this.animate();
    }

    createHelixParticles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 50;
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 4;
            const y = (i / particleCount) * this.canvas.height - 100;
            
            // First helix
            this.particles.push({
                baseAngle: angle,
                baseY: y,
                radius: radius,
                centerX: centerX,
                centerY: centerY,
                size: 3,
                color: '#3b82f6',
                phase: 0
            });
            
            // Second helix (180 degrees out of phase)
            this.particles.push({
                baseAngle: angle + Math.PI,
                baseY: y,
                radius: radius,
                centerX: centerX,
                centerY: centerY,
                size: 3,
                color: '#10b981',
                phase: Math.PI
            });
        }
    }

    updateParticles() {
        this.time += 0.02;
        
        this.particles.forEach(particle => {
            const angle = particle.baseAngle + this.time;
            particle.x = particle.centerX + Math.cos(angle) * particle.radius;
            particle.y = particle.baseY + this.time * 20;
            
            // Reset position when off screen
            if (particle.y > this.canvas.height + 50) {
                particle.y = -50;
            }
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connecting lines between helixes
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.particles.length; i += 2) {
            const particle1 = this.particles[i];
            const particle2 = this.particles[i + 1];
            
            if (particle1 && particle2) {
                this.ctx.beginPath();
                this.ctx.moveTo(particle1.x, particle1.y);
                this.ctx.lineTo(particle2.x, particle2.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 2;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize particle systems
document.addEventListener('DOMContentLoaded', () => {
    // Main particle system
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        new ParticleSystem(particlesContainer);
    }
    
    // Trading chart particles
    const chartContainers = document.querySelectorAll('.trading-chart-container');
    chartContainers.forEach(container => {
        new TradingChartParticles(container);
    });
    
    // DNA helix particles for hero section
    const helixContainers = document.querySelectorAll('.helix-particles');
    helixContainers.forEach(container => {
        new DNAHelixParticles(container);
    });
});