// === Lógica página de inicio ===

// Initialize home page functionality
function initHomePage() {
  // Initialize all components
  if (window.initTheme) window.initTheme();
  if (window.initStepButtons) window.initStepButtons();
  if (window.initPlusMinusButtons) window.initPlusMinusButtons();
  if (window.initSaveButton) window.initSaveButton();

  // Demo: Ver mes
  const viewMonthBtn = document.getElementById('viewMonthBtn');
  if (viewMonthBtn) {
    viewMonthBtn.addEventListener('click', () => {
      if (window.loadPage) {
        window.loadPage('month');
      } else {
        alert('Aquí iría la vista mensual.');
      }
    });
  }
}

// Export for template system
window.initHomePage = initHomePage;