// === Selector de moneda ===

class CurrencySelector {
  constructor() {
    this.currentCurrency = localStorage.getItem('spendtap-currency') || 'EUR';
    this.currencies = {
      'EUR': { symbol: '€', name: 'Euro', icon: '€' },
      'USD': { symbol: '$', name: 'Dollar', icon: '$' },
      'GBP': { symbol: '£', name: 'Pound', icon: '£' }
    };
  }

  // Inicializar selector de moneda
  init() {
    this.setupEventListeners();
  }

  // Configurar event listeners
  setupEventListeners() {
    // Botón para abrir modal
    const currencyBtn = document.getElementById('currencyBtn');
    if (currencyBtn) {
      currencyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Botón cerrar modal
    const closeBtn = document.getElementById('close-currency-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Botones de selección de moneda
    const eurBtn = document.getElementById('select-eur');
    const usdBtn = document.getElementById('select-usd');
    const gbpBtn = document.getElementById('select-gbp');
    
    if (eurBtn) {
      eurBtn.addEventListener('click', () => this.selectCurrency('EUR'));
    }
    if (usdBtn) {
      usdBtn.addEventListener('click', () => this.selectCurrency('USD'));
    }
    if (gbpBtn) {
      gbpBtn.addEventListener('click', () => this.selectCurrency('GBP'));
    }

    // Cerrar modal al hacer click en el fondo
    const modal = document.getElementById('currency-selector-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('currency-selector-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });
  }

  // Abrir modal de selección de moneda
  openModal() {
    const modal = document.getElementById('currency-selector-modal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // Focus en el botón de cerrar
      const closeBtn = document.getElementById('close-currency-modal');
      if (closeBtn) {
        closeBtn.focus();
      }
    }
  }

  // Cerrar modal
  closeModal() {
    const modal = document.getElementById('currency-selector-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Seleccionar moneda
  selectCurrency(currencyCode) {
    if (this.currentCurrency === currencyCode) {
      this.closeModal();
      return;
    }

    this.currentCurrency = currencyCode;
    localStorage.setItem('spendtap-currency', currencyCode);
    
    // Cerrar modal
    this.closeModal();
    
    // Actualizar todos los símbolos de moneda en la UI
    this.updateCurrencySymbols();
  }


  // Actualizar símbolos de moneda en toda la UI
  updateCurrencySymbols() {
    const currency = this.currencies[this.currentCurrency];
    if (!currency) return;

    // Actualizar step values globales
    if (window.STEP_VALUES && window.i18n) {
      const symbol = currency.symbol;
      
      if (this.currentCurrency === 'EUR') {
        window.STEP_VALUES[0].label = window.i18n.t('steps.cents');
        window.STEP_VALUES[1].label = window.i18n.t('steps.euro');
        window.STEP_VALUES[2].label = window.i18n.t('steps.tenEuros');
        window.STEP_VALUES[3].label = window.i18n.t('steps.hundredEuros');
      } else {
        // Para USD y GBP, usar valores genéricos
        window.STEP_VALUES[0].label = `0.10${symbol}`;
        window.STEP_VALUES[1].label = `1${symbol}`;
        window.STEP_VALUES[2].label = `10${symbol}`;
        window.STEP_VALUES[3].label = `100${symbol}`;
      }

      // Actualizar labels visuales actuales
      const stepLabel = document.getElementById('stepLabel');
      const modalStepLabel = document.getElementById('modal-step-label');
      const editStepLabel = document.getElementById('edit-step-label');

      if (stepLabel && window.stepState) {
        stepLabel.textContent = window.STEP_VALUES[window.stepState.currentStepIndex].label;
      }

      if (modalStepLabel && window.homeSaveModal) {
        modalStepLabel.textContent = window.STEP_VALUES[window.homeSaveModal.modalStepState.currentStepIndex].label;
      }

      if (editStepLabel && window.monthView) {
        editStepLabel.textContent = window.STEP_VALUES[window.monthView.editStepState.currentStepIndex].label;
      }
    }

    // Buscar y actualizar todos los elementos con símbolos de moneda
    const currencyElements = document.querySelectorAll('[data-currency]');
    currencyElements.forEach(element => {
      const amount = parseFloat(element.dataset.amount) || 0;
      element.textContent = this.formatCurrency(amount);
    });

    // Re-renderizar vista mensual si está activa
    if (window.monthView && window.monthView.expenses) {
      window.monthView.renderExpensesList();
      window.monthView.renderSummary();
    }

    console.log(`Currency switched to: ${this.currentCurrency} (${currency.symbol})`);
  }

  // Formatear cantidad con moneda actual
  formatCurrency(amount) {
    const currency = this.currencies[this.currentCurrency];
    if (!currency) return `${amount}`;

    if (this.currentCurrency === 'EUR') {
      return `${amount.toFixed(2)}${currency.symbol}`;
    } else {
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  }

  // Obtener moneda actual
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  // Obtener símbolo de moneda actual
  getCurrentSymbol() {
    return this.currencies[this.currentCurrency]?.symbol || '€';
  }
}

// Instancia global
window.currencySelector = new CurrencySelector();

// Función de inicialización
function initCurrencySelector() {
  if (window.currencySelector) {
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      window.currencySelector.init();
    }, 200);
  }
}

window.initCurrencySelector = initCurrencySelector;

export default window.currencySelector;