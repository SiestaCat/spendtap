// === Lógica botón de pasos ===

// Configuración de pasos disponibles
const STEP_VALUES = [
  { value: 0.10, label: '0,10€' },
  { value: 1.00, label: '1€' },
  { value: 10.00, label: '10€' },
  { value: 100.00, label: '100€' }
];

// Estado actual del paso (índice por defecto: 1€)
let currentStepIndex = 1;

// Store step state globally to persist across reloads
if (!window.stepState) {
  window.stepState = { currentStepIndex: 1 };
}

const getCurrentStep = () => STEP_VALUES[window.stepState?.currentStepIndex || 1].value;

// Initialize step functionality
function initStepButtons() {
  const stepBtn = document.getElementById('stepBtn');
  const stepLabel = document.getElementById('stepLabel');

  if (stepBtn && stepLabel) {
    // Use global state to persist across reloads
    currentStepIndex = window.stepState.currentStepIndex;
    stepLabel.textContent = STEP_VALUES[currentStepIndex].label;

    // Add event listener
    stepBtn.addEventListener('click', () => {
      currentStepIndex = (currentStepIndex + 1) % STEP_VALUES.length;
      window.stepState.currentStepIndex = currentStepIndex;
      stepLabel.textContent = STEP_VALUES[currentStepIndex].label;
    });
  }
}

// Export functions
window.initStepButtons = initStepButtons;
window.getCurrentStep = getCurrentStep;
window.STEP_VALUES = STEP_VALUES;