
import { useLocation } from "wouter";
import { useEffect } from "react";
import logoUrl from "@/assets/logo.jpg";

export default function Homepage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Load external scripts
    const loadScript = (src: string) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      return script;
    };

    // Load particles and main scripts
    const particlesScript = loadScript('/scripts/particles.js');
    const mainScript = loadScript('/scripts/main.js');

    return () => {
      // Cleanup scripts on unmount
      if (particlesScript.parentNode) {
        particlesScript.parentNode.removeChild(particlesScript);
      }
      if (mainScript.parentNode) {
        mainScript.parentNode.removeChild(mainScript);
      }
    };
  }, []);

  const handleGetStarted = () => {
    setLocation("/login");
  };

  return (
    <div className="homepage">
      {/* Load CSS */}
      <link rel="stylesheet" href="/styles/main.css" />
      
      {/* Floating Particles Background */}
      <div className="particles-container" id="particles"></div>

      {/* Navigation */}
      <nav className="navbar" id="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <a href="#" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={logoUrl} alt="EdgeMarket Logo" className="logo pulse-animation" style={{ width: '50px', height: '50px' }} />
              <span className="brand-text">EdgeMarket</span>
            </a>
          </div>
          
          <div className="nav-menu" id="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#traders" className="nav-link">For Traders</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
            <a href="#awards" className="nav-link">Awards</a>
            <a href="#cta" className="nav-link">Get Started</a>
          </div>

          <div className="nav-actions">
            <button className="cta-button ripple-effect" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="hero-background-effects">
          <div className="hero-gradient-orb hero-orb-1"></div>
          <div className="hero-gradient-orb hero-orb-2"></div>
          <div className="hero-gradient-orb hero-orb-3"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content fade-in-up">
            <div className="hero-badge">
              <span className="badge-icon">🌍</span>
              <span className="badge-text">Global Multi Trading Platform</span>
            </div>
            <h1 className="hero-title">
              Next-Generation
              <span className="gradient-text"> Trading Excellence</span>
              <br />for Modern Foreign Exchange Markets
            </h1>
            <p className="hero-description">
              Transform your trading journey with EdgeMarket's cutting-edge platform. 
              Access institutional-grade tools, lightning-fast execution, and AI-powered 
              analytics designed for serious traders.
            </p>
            <div className="hero-buttons">
              <button className="hero-primary-btn ripple-effect" onClick={handleGetStarted}>
                <span className="btn-text">Start Trading Now</span>
                <span className="btn-icon">→</span>
              </button>
              <button className="hero-secondary-btn ripple-effect">
                <span className="btn-icon">▶</span>
                <span className="btn-text">Watch Demo</span>
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <span className="stat-number" data-target="750000">0</span>
                <span className="stat-label">Active Traders</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-icon">🟢</div>
                <span className="stat-number" data-target="9420">0</span>
                <span className="stat-label">Active Hardware & Devices</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-icon">⚡</div>
                <span className="stat-number" data-target="98.9">0</span>
                <span className="stat-label">% Uptime</span>
              </div>
            </div>
            <div className="hero-trust-indicators">
              <span className="trust-text">Trusted by professionals worldwide</span>
              <div className="trust-badges">
                <div className="trust-badge">🛡️ Bank-Level Security</div>
                <div className="trust-badge">⚡ Ultra-Low Latency</div>
                <div className="trust-badge">🌍 Global Markets</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-mockup-container">
              <div className="mockup-background-glow"></div>
              <div className="desktop-mockup-wrapper floating-animation">
                <img src={logoUrl} alt="EdgeMarket Trading Platform Desktop" className="desktop-mockup" />
                <div className="mockup-overlay">
                  <div className="trading-stats">
                    <div className="live-indicator">🟢 Live Markets</div>
                    <div className="profit-indicator">+$56,567</div>
                  </div>
                </div>
              </div>
              <div className="mobile-mockup-wrapper floating-delayed">
                <img src={logoUrl} alt="EdgeMarket Mobile App" className="mobile-mockup" />
                <div className="mobile-overlay">
                  <div className="notification-badge">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="section-title">Premium Features</h2>
            <p className="section-description">Everything you need for professional trading success</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="feature-title">Advanced Charts</h3>
              <p className="feature-description">Professional charting with 100+ technical indicators and drawing tools</p>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3 className="feature-title">AI Trading Assistant</h3>
              <p className="feature-description">Machine learning algorithms for market analysis and trade recommendations</p>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="feature-title">Bank-Level Security</h3>
              <p className="feature-description">Multi-layer encryption and secure custody for your digital assets</p>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="feature-title">Lightning Execution</h3>
              <p className="feature-description">Ultra-low latency execution with direct market access</p>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-globe"></i>
              </div>
              <h3 className="feature-title">Global Markets</h3>
              <p className="feature-description">Access to forex, stocks, commodities, and crypto markets worldwide</p>
            </div>
            
            <div className="feature-card hover-lift">
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3 className="feature-title">24/7 Support</h3>
              <p className="feature-description">Dedicated support team available around the clock</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Every Trader Section */}
      <section className="trader-section" id="traders">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="section-title">For Every Trader</h2>
            <p className="section-description">Whether you're a beginner or professional, we have the right tools</p>
          </div>
          
          <div className="trader-types">
            <div className="trader-card">
              <div className="trader-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Beginners</h3>
              <p>Easy-to-use interface with educational resources and demo accounts</p>
              <ul>
                <li>Paper trading</li>
                <li>Video tutorials</li>
                <li>Risk management tools</li>
              </ul>
            </div>
            
            <div className="trader-card">
              <div className="trader-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Active Traders</h3>
              <p>Advanced tools for day trading and swing trading strategies</p>
              <ul>
                <li>Real-time alerts</li>
                <li>Advanced orders</li>
                <li>Multi-monitor support</li>
              </ul>
            </div>
            
            <div className="trader-card">
              <div className="trader-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Institutions</h3>
              <p>Enterprise solutions with institutional pricing and support</p>
              <ul>
                <li>Prime brokerage</li>
                <li>Custom APIs</li>
                <li>Dedicated account manager</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="section-title">What Elite Traders Say</h2>
            <p className="section-description">Join thousands of successful traders who trust EdgeMarket</p>
          </div>
          
          <div className="testimonials-container">
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                </div>
                <div className="testimonial-content">
                  <p>"EdgeMarket has completely transformed my trading performance. The AI insights and lightning-fast execution speed are absolutely unmatched in the industry."</p>
                </div>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Michael Chen" className="author-avatar" />
                  <div className="author-info">
                    <h4>Michael Chen</h4>
                    <span>Senior Portfolio Manager</span>
                    <div className="author-company">Goldman Sachs</div>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-card featured">
                <div className="featured-badge">Featured Review</div>
                <div className="testimonial-rating">
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                </div>
                <div className="testimonial-content">
                  <p>"The platform's rock-solid reliability and comprehensive advanced features have enabled me to scale my trading operations by 300% this year alone."</p>
                </div>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=100&h=100&fit=crop&crop=face" alt="Sarah Williams" className="author-avatar" />
                  <div className="author-info">
                    <h4>Sarah Williams</h4>
                    <span>Hedge Fund Trader</span>
                    <div className="author-company">Blackstone Group</div>
                  </div>
                </div>
              </div>
              
              <div className="testimonial-card">
                <div className="testimonial-rating">
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                  <span className="star">⭐</span>
                </div>
                <div className="testimonial-content">
                  <p>"Outstanding 24/7 customer support and the most comprehensive suite of trading tools I've ever experienced. Highly recommend to serious traders!"</p>
                </div>
                <div className="testimonial-author">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="David Rodriguez" className="author-avatar" />
                  <div className="author-info">
                    <h4>David Rodriguez</h4>
                    <span>Independent Trader</span>
                    <div className="author-company">10+ Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonials-stats">
              <div className="stats-item">
                <div className="stats-number">4.9/5</div>
                <div className="stats-label">Average Rating</div>
              </div>
              <div className="stats-divider"></div>
              <div className="stats-item">
                <div className="stats-number">25,000+</div>
                <div className="stats-label">Reviews</div>
              </div>
              <div className="stats-divider"></div>
              <div className="stats-item">
                <div className="stats-number">98%</div>
                <div className="stats-label">Recommend Us</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="awards-section" id="awards">
        <div className="container">
          <div className="section-header fade-in-up">
            <h2 className="section-title">Industry Recognition</h2>
            <p className="section-description">Awarded by leading financial institutions worldwide</p>
          </div>
          
          <div className="awards-grid">
            <div className="award-item">
              <i className="fas fa-trophy award-icon"></i>
              <h4>Best Trading Platform 2024</h4>
              <p>Financial Technology Awards</p>
            </div>
            <div className="award-item">
              <i className="fas fa-medal award-icon"></i>
              <h4>Innovation Excellence</h4>
              <p>Global Finance Magazine</p>
            </div>
            <div className="award-item">
              <i className="fas fa-star award-icon"></i>
              <h4>Customer Choice Award</h4>
              <p>Trading Platform Review</p>
            </div>
            <div className="award-item">
              <i className="fas fa-gem award-icon"></i>
              <h4>Security Excellence</h4>
              <p>Cybersecurity Institute</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="cta">
        <div className="container">
          <div className="cta-content fade-in-up">
            <h2 className="cta-title">Ready to Transform Your Trading?</h2>
            <p className="cta-description">Join thousands of successful traders and start your journey with EdgeMarket today</p>
            <div className="cta-buttons">
              <button className="primary-button large ripple-effect" onClick={handleGetStarted}>
                Open Trading Account
              </button>
              <button className="secondary-button large ripple-effect">
                Download Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <img src={logoUrl} alt="EdgeMarket Logo" className="footer-logo" />
                <span className="footer-brand-text">EdgeMarket</span>
              </div>
              <p className="footer-description">The premier multi-asset trading platform for professional traders worldwide.</p>
              <div className="social-links">
                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
                <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Trading</h4>
              <ul className="footer-links">
                <li><a href="#trading">Forex</a></li>
                <li><a href="#trading">Stocks</a></li>
                <li><a href="#trading">Commodities</a></li>
                <li><a href="#trading">Cryptocurrency</a></li>
                <li><a href="#trading">Indices</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Platform</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#traders">For Traders</a></li>
                <li><a href="#testimonials">Reviews</a></li>
                <li><a href="#awards">Awards</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Support</h4>
              <ul className="footer-links">
                <li><a href="#cta">Contact Us</a></li>
                <li><a href="#features">Help Center</a></li>
                <li><a href="#traders">Tutorials</a></li>
                <li><a href="#testimonials">Community</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Company</h4>
              <ul className="footer-links">
                <li><a href="#cta">About Us</a></li>
                <li><a href="#awards">Awards</a></li>
                <li><a href="#testimonials">News</a></li>
                <li><a href="#features">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-brand">
              <img src={logoUrl} alt="EdgeMarket Logo" className="footer-logo" style={{ width: '50px', height: '50px' }} />
            </div>
            <div className="footer-legal">
              <p>&copy; 2025 EdgeMarket. All rights reserved.</p>
              <div className="legal-links">
                <a href="#cta">Privacy Policy</a>
                <a href="#cta">Terms of Service</a>
                <a href="#cta">Risk Disclosure</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
