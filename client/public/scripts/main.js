// App.js
import React, { useEffect, useRef } from 'react';
import './App.css'; // Assuming you have a CSS file for styling

function App() {
  const rippleStylesRef = useRef(null);
  const revealElementsRef = useRef([]);
  const revealObserverRef = useRef(null);
  const navbarRef = useRef(null);
  const lastScrollRef = useRef(0);

  useEffect(() => {
    // Add ripple effect CSS if not already present
    if (!rippleStylesRef.current) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
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
      `;
      document.head.appendChild(style);
      rippleStylesRef.current = style;
    }

    // Ripple effect for buttons
    document.querySelectorAll('.ripple-effect').forEach(button => {
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        this.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Smooth reveal animations on scroll
    revealElementsRef.current = document.querySelectorAll('.fade-in-up, [data-aos]');
    revealObserverRef.current = new IntersectionObserver((entries) => {
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

    revealElementsRef.current.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      revealObserverRef.current.observe(el);
    });

    // Navigation scroll effect
    navbarRef.current = document.getElementById('navbar');
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      if (navbarRef.current) {
        if (currentScroll <= 0) {
          navbarRef.current.classList.remove('scroll-up');
          return;
        }

        if (currentScroll > lastScrollRef.current && !navbarRef.current.classList.contains('scroll-down')) {
          navbarRef.current.classList.remove('scroll-up');
          navbarRef.current.classList.add('scroll-down');
        } else if (currentScroll < lastScrollRef.current && navbarRef.current.classList.contains('scroll-down')) {
          navbarRef.current.classList.remove('scroll-down');
          navbarRef.current.classList.add('scroll-up');
        }
      }
      lastScrollRef.current = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);

    // Add dynamic loading states for images
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
    });

    // Close button functionality
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        // Close functionality
        console.log("Close button clicked"); // Placeholder for actual close logic
      });
    }

    // Counter animation
    const animateCounters = () => {
      const counters = document.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
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
    animateCounters();

    // Initialize particles if the container exists
    if (document.getElementById('particles')) {
      // initParticles(); // Assuming initParticles() is defined elsewhere or will be provided
      console.log("Particles container found, but initParticles() is not defined or called.");
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    if (themeToggle && themeIcon) {
      themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');

        if (document.body.classList.contains('dark-theme')) {
          themeIcon.classList.remove('fa-moon');
          themeIcon.classList.add('fa-sun');
        } else {
          themeIcon.classList.remove('fa-sun');
          themeIcon.classList.add('fa-moon');
        }
      });
    }

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

    // Cleanup function to remove event listeners and observers
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (revealObserverRef.current) {
        revealElementsRef.current.forEach(el => {
          revealObserverRef.current.unobserve(el);
        });
      }
      // Remove all dynamically added event listeners for buttons, images, etc. if necessary for full cleanup.
      // For simplicity, we're relying on component unmount here.
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div>
      {/* Mock HTML elements that the JavaScript interacts with */}
      {/* This structure is a guess based on common patterns and script selectors */}

      <header id="navbar" className="navbar">
        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <button id="theme-toggle" className="ripple-effect">
            <i id="theme-icon" className="fas fa-moon"></i> {/* Example icon */}
          </button>
        </nav>
        <button id="mobile-menu-btn">Menu</button>
      </header>

      <main>
        <section id="home" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
          <h1>Welcome to the Landing Page</h1>
          <button className="ripple-effect">Click Me</button>
        </section>

        <section id="about" className="fade-in-up" style={{ height: '50vh', padding: '50px', background: '#e0e0e0' }}>
          <h2>About Us</h2>
          <p>This is the about section.</p>
        </section>

        <section id="services" className="fade-in-up" style={{ height: '70vh', padding: '50px', background: '#d0d0d0' }}>
          <h2>Our Services</h2>
          <p>Service 1</p>
          <p>Service 2</p>
          <p className="stat-number" data-target="12345">0</p>
        </section>

        <section id="contact" style={{ height: '50vh', padding: '50px', background: '#c0c0c0' }}>
          <h2>Contact Us</h2>
          <form>
            <input type="text" placeholder="Your Name" />
            <button type="submit" className="ripple-effect">Send</button>
          </form>
          <button className="close-btn">Close</button>
        </section>

        {/* Element for particles */}
        <div id="particles"></div>

        {/* Images for testing load effect */}
        <img src="https://via.placeholder.com/150" alt="Placeholder 1" />
        <img src="https://via.placeholder.com/150" alt="Placeholder 2" />

      </main>

      {/* Mobile menu */}
      <nav id="nav-menu">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  );
}

export default App;