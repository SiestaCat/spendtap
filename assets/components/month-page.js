// === Lógica página mensual ===

// Initialize month page functionality
function initMonthPage() {
  // Initialize all components
  if (window.initTheme) window.initTheme();
  if (window.initDateManager) window.initDateManager();
  if (window.initMonthView) window.initMonthView();
  if (window.initLanguageSelector) window.initLanguageSelector();

  // Show date section for month page
  const homeDate = document.getElementById('home-date');
  if (homeDate) {
    homeDate.classList.remove('hidden');
  }
}

// Export for template system
window.initMonthPage = initMonthPage;