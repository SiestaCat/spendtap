// === Selector de idioma ===

class LanguageSelector {
  constructor() {
    this.currentLanguage = localStorage.getItem('spendtap-language') || 'es';
  }

  // Inicializar selector de idioma
  init() {
    this.setupEventListeners();
  }

  // Configurar event listeners
  setupEventListeners() {
    // Botón para abrir modal
    const languageBtn = document.getElementById('languageBtn');
    if (languageBtn) {
      languageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }

    // Botón cerrar modal
    const closeBtn = document.getElementById('close-language-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Botones de selección de idioma
    const spanishBtn = document.getElementById('select-spanish');
    const englishBtn = document.getElementById('select-english');
    
    if (spanishBtn) {
      spanishBtn.addEventListener('click', () => this.selectLanguage('es'));
    }
    if (englishBtn) {
      englishBtn.addEventListener('click', () => this.selectLanguage('en'));
    }

    // Cerrar modal al hacer click en el fondo
    const modal = document.getElementById('language-selector-modal');
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
        const modal = document.getElementById('language-selector-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });
  }

  // Abrir modal de selección de idioma
  openModal() {
    const modal = document.getElementById('language-selector-modal');
    if (modal) {
      modal.classList.remove('hidden');
      
      // Focus en el botón de cerrar
      const closeBtn = document.getElementById('close-language-modal');
      if (closeBtn) {
        closeBtn.focus();
      }
    }
  }

  // Cerrar modal
  closeModal() {
    const modal = document.getElementById('language-selector-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  // Seleccionar idioma
  async selectLanguage(languageCode) {
    if (this.currentLanguage === languageCode) {
      this.closeModal();
      return;
    }

    this.currentLanguage = languageCode;
    
    // Cerrar modal
    this.closeModal();
    
    // Usar el sistema i18n existente para cambiar idioma sin recargar
    if (window.i18n && window.i18n.setLanguage) {
      await window.i18n.setLanguage(languageCode, false);
      
      // Actualizar labels de pasos
      this.updateStepLabels();
    }
  }

  // Actualizar labels de pasos con traducciones
  updateStepLabels() {
    if (window.STEP_VALUES && window.i18n) {
      window.STEP_VALUES[0].label = window.i18n.t('steps.cents');
      window.STEP_VALUES[1].label = window.i18n.t('steps.euro');
      window.STEP_VALUES[2].label = window.i18n.t('steps.tenEuros');
      window.STEP_VALUES[3].label = window.i18n.t('steps.hundredEuros');

      // Actualizar labels visuales actuales
      const stepLabel = document.getElementById('stepLabel');
      const modalStepLabel = document.getElementById('modal-step-label');
      const editStepLabel = document.getElementById('edit-step-label');

      // Actualizar step label principal si existe
      if (stepLabel && window.stepState) {
        stepLabel.textContent = window.STEP_VALUES[window.stepState.currentStepIndex].label;
      }

      // Actualizar otros step labels si existen
      if (modalStepLabel && window.homeSaveModal) {
        modalStepLabel.textContent = window.STEP_VALUES[window.homeSaveModal.modalStepState.currentStepIndex].label;
      }

      if (editStepLabel && window.monthView) {
        editStepLabel.textContent = window.STEP_VALUES[window.monthView.editStepState.currentStepIndex].label;
      }
    }
  }
}

// Instancia global
window.languageSelector = new LanguageSelector();

// Función de inicialización
function initLanguageSelector() {
  if (window.languageSelector) {
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      window.languageSelector.init();
    }, 200);
  }
}

window.initLanguageSelector = initLanguageSelector;

export default window.languageSelector;