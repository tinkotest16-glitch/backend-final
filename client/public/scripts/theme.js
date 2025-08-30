// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const logo = document.querySelector('.nav-brand img');
    const isInPagesDir = window.location.pathname.includes('/pages/');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-theme', savedTheme === 'light');
    updateThemeUI(savedTheme);

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        const theme = isLight ? 'light' : 'dark';
        localStorage.setItem('theme', theme);
        updateThemeUI(theme);
    });

    function updateThemeUI(theme) {
        // Update icon
        themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Update logo with correct path based on current directory
        const basePath = isInPagesDir ? '../' : './';
        logo.src = theme === 'light' 
            ? `${basePath}src/assets/logo.jpg` 
            : `${basePath}src/assets/logo1.jpg`;
        
        // Add animation class
        themeToggle.classList.add('theme-toggle-animation');
        setTimeout(() => {
            themeToggle.classList.remove('theme-toggle-animation');
        }, 300);
    }
});
