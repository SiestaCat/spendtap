// === Tema (por defecto: sistema) ===
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const Theme = {
  get() { return localStorage.getItem('theme') || 'system'; },
  set(mode) { localStorage.setItem('theme', mode); this.apply(mode); },
  apply(mode) {
    const root = document.documentElement;
    root.classList.remove('dark');
    if (mode === 'dark') root.classList.add('dark');
    if (mode === 'system') {
      if (prefersDark.matches) root.classList.add('dark');
    }
    // Actualiza UI
    if (mode === 'system') {
      themeLabel.textContent = 'Tema: Sistema';
      themeIcon.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' class='w-4 h-4'>
          <path stroke-linecap='round' stroke-linejoin='round' d='M3 16.5A1.5 1.5 0 0 0 4.5 18h15a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 19.5 6h-15A1.5 1.5 0 0 0 3 7.5v9Z' />
          <path stroke-linecap='round' stroke-linejoin='round' d='M3 16.5h18M8.25 18h7.5' />
        </svg>`;
    } else if (mode === 'light') {
      themeLabel.textContent = 'Tema: Claro';
      themeIcon.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' class='w-4 h-4'>
          <path stroke-linecap='round' stroke-linejoin='round' d='M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M7.05 7.05 5.64 5.64m12.02 0-1.41 1.41M7.05 16.95l-1.41 1.41' />
          <circle cx='12' cy='12' r='4'/>
        </svg>`;
    } else {
      themeLabel.textContent = 'Tema: Oscuro';
      themeIcon.innerHTML = `
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' class='w-4 h-4'>
          <path stroke-linecap='round' stroke-linejoin='round' d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>`;
    }
  }
};

// Inicializa en sistema por defecto
Theme.apply(Theme.get());

// Reacciona a cambio del sistema si está en "sistema"
prefersDark.addEventListener('change', () => {
  if (Theme.get() === 'system') Theme.apply('system');
});

// Toggle de tema: sistema -> claro -> oscuro -> sistema
themeBtn.addEventListener('click', () => {
  const current = Theme.get();
  const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  Theme.set(next);
});

// Initialize theme functionality
function initTheme() {
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  if (themeBtn && themeIcon && themeLabel) {
    // Re-apply current theme
    Theme.apply(Theme.get());

    // Add event listener for theme switching
    themeBtn.addEventListener('click', () => {
      const current = Theme.get();
      const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
      Theme.set(next);
    });
  }
}

// Export for template system
window.initTheme = initTheme;
window.Theme = Theme;