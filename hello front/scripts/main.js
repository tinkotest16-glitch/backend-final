/* EdgeMarket Trading Platform - Component Styles */

/* Buttons */
.primary-button,
.secondary-button,
.cta-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all var(--transition-normal);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.primary-button {
    background: var(--gradient-primary);
    color: white;
    box-shadow: var(--shadow-md);
}

.primary-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.primary-button:active {
    transform: translateY(0);
}

.secondary-button {
    background: transparent;
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.secondary-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
}

.cta-button {
    background: var(--gradient-primary);
    color: white;
    font-size: var(--font-size-sm);
    padding: var(--space-xs) var(--space-md);
}

.cta-button:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-glow);
}

.large {
    padding: var(--space-md) var(--space-xl);
    font-size: var(--font-size-lg);
}

/* Ripple Effect */
.ripple-effect {
    position: relative;
    overflow: hidden;
}

.ripple-effect::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: width 0.6s, height 0.6s;
    transform: translate(-50%, -50%);
    z-index: 0;
}

.ripple-effect:active::before {
    width: 300px;
    height: 300px;
}

.ripple-effect > * {
    position: relative;
    z-index: 1;
}

/* Cards */
.card {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    transition: all var(--transition-normal);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-theme .card {
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
}

.glass-card {
    background: var(--gradient-card);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Forms */
.form-group {
    margin-bottom: var(--space-md);
}

.form-label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
    color: var(--text-primary);
}

.form-input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
}

.dark-theme .form-input {
    border-color: rgba(255, 255, 255, 0.2);
}

.form-input:focus {
    outline: none;
    border-color: var(--brand-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

/* Badges */
.badge {
    display: inline-flex;
    align-items: center;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-primary {
    background: var(--gradient-primary);
    color: white;
}

.badge-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
}

.badge-success {
    background: #10b981;
    color: white;
}

.badge-warning {
    background: #f59e0b;
    color: white;
}

.badge-danger {
    background: #ef4444;
    color: white;
}

/* Progress Bars */
.progress-bar {
    width: 100%;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    transition: width var(--transition-slow);
    border-radius: var(--radius-sm);
}

/* Tabs */
.tabs {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    margin-bottom: var(--space-lg);
}

.dark-theme .tabs {
    border-bottom-color: rgba(255, 255, 255, 0.2);
}

.tab-list {
    display: flex;
    gap: var(--space-lg);
}

.tab-button {
    background: none;
    border: none;
    padding: var(--space-sm) 0;
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    position: relative;
    transition: all var(--transition-fast);
}

.tab-button.active {
    color: var(--brand-primary);
}

.tab-button::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--brand-primary);
    transition: width var(--transition-normal);
}

.tab-button.active::after {
    width: 100%;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

/* Alerts */
.alert {
    padding: var(--space-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
    border-left: 4px solid;
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
}

.alert-success {
    background: rgba(16, 185, 129, 0.1);
    border-left-color: #10b981;
    color: #065f46;
}

.dark-theme .alert-success {
    color: #6ee7b7;
}

.alert-warning {
    background: rgba(245, 158, 11, 0.1);
    border-left-color: #f59e0b;
    color: #92400e;
}

.dark-theme .alert-warning {
    color: #fcd34d;
}

.alert-error {
    background: rgba(239, 68, 68, 0.1);
    border-left-color: #ef4444;
    color: #991b1b;
}

.dark-theme .alert-error {
    color: #fca5a5;
}

.alert-info {
    background: rgba(59, 130, 246, 0.1);
    border-left-color: #3b82f6;
    color: #1e40af;
}

.dark-theme .alert-info {
    color: #93c5fd;
}

/* Modals */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.modal {
    background: var(--bg-primary);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    transform: scale(0.9) translateY(-50px);
    transition: all var(--transition-normal);
}

.modal-overlay.active .modal {
    transform: scale(1) translateY(0);
}

.modal-header {
    padding: var(--space-lg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.dark-theme .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.2);
}

.modal-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
}

.modal-close:hover {
    background: var(--bg-tertiary);
}

.modal-body {
    padding: var(--space-lg);
}

.modal-footer {
    padding: var(--space-lg);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
}

.dark-theme .modal-footer {
    border-top-color: rgba(255, 255, 255, 0.2);
}

/* Tooltips */
.tooltip {
    position: relative;
    display: inline-block;
}

.tooltip::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
    z-index: var(--z-tooltip);
}

.tooltip::after {
    content: '';
    position: absolute;
    bottom: 115%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
    z-index: var(--z-tooltip);
}

.tooltip:hover::before,
.tooltip:hover::after {
    opacity: 1;
    visibility: visible;
}

/* Dropdown */
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl);
    border: 1px solid rgba(0, 0, 0, 0.1);
    z-index: var(--z-dropdown);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all var(--transition-fast);
}

.dark-theme .dropdown-menu {
    border-color: rgba(255, 255, 255, 0.2);
}

.dropdown.active .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
}

.dropdown-item:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.dropdown-item:first-child {
    border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.dropdown-item:last-child {
    border-radius: 0 0 var(--radius-md) var(--radius-md);
}

/* Utility Classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.d-none { display: none; }
.d-block { display: block; }
.d-flex { display: flex; }
.d-grid { display: grid; }

.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.align-center { align-items: center; }
.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }

.gap-xs { gap: var(--space-xs); }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
.gap-lg { gap: var(--space-lg); }
.gap-xl { gap: var(--space-xl); }

.m-0 { margin: 0; }
.mt-0 { margin-top: 0; }
.mb-0 { margin-bottom: 0; }
.ml-0 { margin-left: 0; }
.mr-0 { margin-right: 0; }

.p-0 { padding: 0; }
.pt-0 { padding-top: 0; }
.pb-0 { padding-bottom: 0; }
.pl-0 { padding-left: 0; }
.pr-0 { padding-right: 0; }

.w-full { width: 100%; }
.h-full { height: 100%; }

.opacity-0 { opacity: 0; }
.opacity-50 { opacity: 0.5; }
.opacity-100 { opacity: 1; }

.pointer-events-none { pointer-events: none; }
.cursor-pointer { cursor: pointer; }

.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }

.position-relative { position: relative; }
.position-absolute { position: absolute; }
.position-fixed { position: fixed; }

.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }

/* Responsive Utilities */
@media (max-width: 768px) {
    .md-hidden { display: none !important; }
    .md-block { display: block !important; }
    .md-flex { display: flex !important; }
    
    .md-text-center { text-align: center !important; }
    .md-text-left { text-align: left !important; }
    
    .md-w-full { width: 100% !important; }
}

@media (max-width: 480px) {
    .sm-hidden { display: none !important; }
    .sm-block { display: block !important; }
    .sm-flex { display: flex !important; }
    
    .sm-text-center { text-align: center !important; }
    .sm-text-left { text-align: left !important; }
    
    .sm-w-full { width: 100% !important; }
}