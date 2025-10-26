// === Lógica botón guardar ===

let toastTimer;

// Initialize save button
function initSaveButton() {
  const saveBtn = document.getElementById('saveBtn');
  const toast = document.querySelector('#toast > div');

  if (saveBtn && toast) {
    saveBtn.addEventListener('click', () => {
      toast.classList.remove('hidden');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.add('hidden'), 1400);
    });
  }
}

// Export functions
window.initSaveButton = initSaveButton;