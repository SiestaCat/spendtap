// === Lógica página de inicio ===

// Initialize home page functionality
function initHomePage() {
  // Initialize all components
  if (window.initTheme) window.initTheme();
  if (window.initStepButtons) window.initStepButtons();
  if (window.initPlusMinusButtons) window.initPlusMinusButtons();
  if (window.initSaveButton) window.initSaveButton();
  if (window.initDateManager) window.initDateManager();

  // Show date only on home page
  const homeDate = document.getElementById('home-date');
  if (homeDate) {
    homeDate.classList.remove('hidden');
  }

  // Navegar a vista mensual
  const viewMonthBtn = document.getElementById('viewMonthBtn');
  if (viewMonthBtn) {
    viewMonthBtn.addEventListener('click', () => {
      if (window.loadPage) {
        window.loadPage('month');
      }
    });
  }
}

// Export for template system
window.initHomePage = initHomePage;