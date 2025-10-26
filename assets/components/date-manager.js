// === Gestor de fechas y parámetros URL ===

class DateManager {
  constructor() {
    this.currentDate = new Date();
  }

  // Parsear parámetros de URL
  parseURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const month = urlParams.get('month');
    const year = urlParams.get('year');
    
    return {
      month: month ? parseInt(month, 10) : null,
      year: year ? parseInt(year, 10) : null
    };
  }

  // Obtener fecha actual o de parámetros URL
  getCurrentMonthYear() {
    const params = this.parseURLParams();
    const now = new Date();
    
    const month = params.month || (now.getMonth() + 1); // +1 porque getMonth() es 0-indexado
    const year = params.year || now.getFullYear();
    
    // Validar que el mes esté entre 1-12
    const validMonth = Math.max(1, Math.min(12, month));
    
    return {
      month: validMonth,
      year: year
    };
  }

  // Obtener nombre del mes traducido
  getMonthName(monthNumber) {
    const monthKey = `months.${monthNumber}`;
    return window.t ? window.t(monthKey) : `Month ${monthNumber}`;
  }

  // Formatear fecha para mostrar
  formatCurrentDate() {
    const { month, year } = this.getCurrentMonthYear();
    const monthName = this.getMonthName(month);
    return `${monthName} ${year}`;
  }

  // Actualizar el elemento de fecha en el DOM
  updateDateDisplay() {
    const dateElement = document.querySelector('[data-i18n="app.currentMonth"]');
    if (dateElement) {
      dateElement.textContent = this.formatCurrentDate();
    }
    this.updateNavigationButtons();
  }

  // Actualizar los labels de los botones de navegación
  updateNavigationButtons() {
    const { month, year } = this.getCurrentMonthYear();
    
    // Calcular fechas anteriores y siguientes
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevMonthYear = month === 1 ? year - 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextMonthYear = month === 12 ? year + 1 : year;
    
    // Actualizar labels
    const prevYearLabel = document.getElementById('prevYearLabel');
    const prevMonthLabel = document.getElementById('prevMonthLabel');
    const nextMonthLabel = document.getElementById('nextMonthLabel');
    const nextYearLabel = document.getElementById('nextYearLabel');
    
    if (prevYearLabel) prevYearLabel.textContent = year - 1;
    if (prevMonthLabel) prevMonthLabel.textContent = this.getShortMonthName(prevMonth);
    if (nextMonthLabel) nextMonthLabel.textContent = this.getShortMonthName(nextMonth);
    if (nextYearLabel) nextYearLabel.textContent = year + 1;
  }

  // Obtener nombre corto del mes (3 letras)
  getShortMonthName(monthNumber) {
    const monthName = this.getMonthName(monthNumber);
    return monthName.substring(0, 3);
  }

  // Navegar a mes anterior
  navigateToPrevMonth() {
    const { month, year } = this.getCurrentMonthYear();
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    this.navigateToDate(newMonth, newYear);
  }

  // Navegar a mes siguiente
  navigateToNextMonth() {
    const { month, year } = this.getCurrentMonthYear();
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    this.navigateToDate(newMonth, newYear);
  }

  // Navegar a año anterior
  navigateToPrevYear() {
    const { month, year } = this.getCurrentMonthYear();
    this.navigateToDate(month, year - 1);
  }

  // Navegar a año siguiente
  navigateToNextYear() {
    const { month, year } = this.getCurrentMonthYear();
    this.navigateToDate(month, year + 1);
  }

  // Navegar a fecha específica actualizando URL
  navigateToDate(month, year) {
    const url = new URL(window.location);
    url.searchParams.set('month', month);
    url.searchParams.set('year', year);
    
    // Actualizar URL sin recargar página
    window.history.pushState({}, '', url.toString());
    
    // Actualizar display
    this.updateDateDisplay();
    
    // Si estamos en la vista mensual, regenerar los gastos
    if (window.location.pathname === '/month' && window.monthView) {
      window.monthView.init();
    }
  }
}

// Instancia global
window.dateManager = new DateManager();

// Función de inicialización
function initDateManager() {
  if (window.dateManager) {
    window.dateManager.updateDateDisplay();
    
    // Agregar event listeners a los botones
    const prevYearBtn = document.getElementById('prevYearBtn');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const nextYearBtn = document.getElementById('nextYearBtn');
    
    if (prevYearBtn) {
      prevYearBtn.addEventListener('click', () => window.dateManager.navigateToPrevYear());
    }
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => window.dateManager.navigateToPrevMonth());
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => window.dateManager.navigateToNextMonth());
    }
    if (nextYearBtn) {
      nextYearBtn.addEventListener('click', () => window.dateManager.navigateToNextYear());
    }
  }
}

window.initDateManager = initDateManager;

export default window.dateManager;