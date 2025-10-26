// === Lógica botones +/- ===

let intervalId = null;

const updateValue = (increment) => {
  const step = window.getCurrentStep ? window.getCurrentStep() : 1.00;
  const numberInput = document.getElementById('numberInput');
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

// Initialize plus/minus buttons
function initPlusMinusButtons() {
  const minusBtn = document.getElementById('minusBtn');
  const plusBtn = document.getElementById('plusBtn');

  if (minusBtn && plusBtn) {
    // Remove any existing listeners by cloning nodes
    const newMinusBtn = minusBtn.cloneNode(true);
    const newPlusBtn = plusBtn.cloneNode(true);
    minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
    plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);

    // Add new event listeners
    // Eventos para botón menos
    newMinusBtn.addEventListener('mousedown', () => startInterval(false));
    newMinusBtn.addEventListener('mouseup', stopInterval);
    newMinusBtn.addEventListener('mouseleave', stopInterval);
    newMinusBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startInterval(false);
    });
    newMinusBtn.addEventListener('touchend', stopInterval);
    newMinusBtn.addEventListener('touchcancel', stopInterval);

    // Eventos para botón más
    newPlusBtn.addEventListener('mousedown', () => startInterval(true));
    newPlusBtn.addEventListener('mouseup', stopInterval);
    newPlusBtn.addEventListener('mouseleave', stopInterval);
    newPlusBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startInterval(true);
    });
    newPlusBtn.addEventListener('touchend', stopInterval);
    newPlusBtn.addEventListener('touchcancel', stopInterval);
  }
}

// Export functions
window.initPlusMinusButtons = initPlusMinusButtons;