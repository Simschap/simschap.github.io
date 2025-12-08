export function initTheme() {
    const toggleButton = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Load saved theme or use system preference
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleButton.textContent = '☀️';
    } else if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        toggleButton.textContent = '🌙';
    } else if (prefersDarkScheme.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleButton.textContent = '☀️';
    }

    toggleButton.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');

        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            toggleButton.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            toggleButton.textContent = '☀️';
        }
    });
}
