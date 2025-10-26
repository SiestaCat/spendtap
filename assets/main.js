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

// === Lógica +/- ===
const minusBtn = document.getElementById('minusBtn');
const plusBtn = document.getElementById('plusBtn');
const numberInput = document.getElementById('numberInput');
const stepBtn = document.getElementById('stepBtn');
const stepLabel = document.getElementById('stepLabel');

let intervalId = null;

// Configuración de pasos disponibles
const STEP_VALUES = [
  { value: 0.10, label: '0,10€' },
  { value: 1, label: '1€' },
  { value: 10, label: '10€' },
  { value: 100, label: '100€' }
];

// Estado actual del paso (índice por defecto: 1€)
let currentStepIndex = 1;

const getCurrentStep = () => STEP_VALUES[currentStepIndex].value;

const updateValue = (increment) => {
  const step = getCurrentStep();
  const min = numberInput.min === '' ? -Infinity : Number(numberInput.min);
  const currentVal = Number(numberInput.value || 0);
  const newVal = increment ? currentVal + step : currentVal - step;
  numberInput.value = Math.max(newVal, min).toFixed(2);
};

const startInterval = (increment) => {
  updateValue(increment);
  intervalId = setInterval(() => updateValue(increment), 100);
};

const stopInterval = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

// Cambiar paso al hacer clic en el botón selector
stepBtn.addEventListener('click', () => {
  currentStepIndex = (currentStepIndex + 1) % STEP_VALUES.length;
  stepLabel.textContent = STEP_VALUES[currentStepIndex].label;
});

// Eventos para botón menos
minusBtn.addEventListener('mousedown', () => startInterval(false));
minusBtn.addEventListener('mouseup', stopInterval);
minusBtn.addEventListener('mouseleave', stopInterval);
minusBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startInterval(false);
});
minusBtn.addEventListener('touchend', stopInterval);
minusBtn.addEventListener('touchcancel', stopInterval);

// Eventos para botón más
plusBtn.addEventListener('mousedown', () => startInterval(true));
plusBtn.addEventListener('mouseup', stopInterval);
plusBtn.addEventListener('mouseleave', stopInterval);
plusBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startInterval(true);
});
plusBtn.addEventListener('touchend', stopInterval);
plusBtn.addEventListener('touchcancel', stopInterval);

// === Guardar (toast) ===
const saveBtn = document.getElementById('saveBtn');
const toast = document.querySelector('#toast > div');
let toastTimer;

saveBtn.addEventListener('click', () => {
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 1400);
});

// Demo: Ver mes
document.getElementById('viewMonthBtn').addEventListener('click', () => {
  alert('Aquí iría la vista mensual.');
});