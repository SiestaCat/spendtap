// === Modal de guardado para la página home ===

class HomeSaveModal {
  constructor() {
    this.modalStepState = { currentStepIndex: 1 };
    this.allDescriptions = [];
    this.allCategories = [];
    this.isSaving = false; // Evitar múltiples clicks
  }

  // Inicializar modal
  init() {
    this.setupEventListeners();
  }

  // Configurar event listeners
  setupEventListeners() {
    // Botón abrir modal
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.openModal());
    }

    // Botón cerrar modal
    const closeBtn = document.getElementById('close-save-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Botón cancelar
    const cancelBtn = document.getElementById('cancel-save');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Botones confirmar guardar (footer y header)
    const confirmBtn = document.getElementById('confirm-save');
    const confirmHeaderBtn = document.getElementById('confirm-save-header');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.saveTransaction());
    }
    if (confirmHeaderBtn) {
      confirmHeaderBtn.addEventListener('click', () => this.saveTransaction());
    }

    // Cerrar modal al hacer click en el fondo
    const modal = document.getElementById('save-transaction-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }

    // Configurar controles de cantidad
    this.setupAmountControls();

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('save-transaction-modal');
        if (modal && !modal.classList.contains('hidden')) {
          this.closeModal();
        }
      }
    });
  }

  // Configurar controles de cantidad
  setupAmountControls() {
    const minusBtn = document.getElementById('modal-minus-btn');
    const plusBtn = document.getElementById('modal-plus-btn');
    const stepBtn = document.getElementById('modal-step-btn');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => this.adjustAmount(false));
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', () => this.adjustAmount(true));
    }
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.cycleStep());
    }
  }

  // Ajustar cantidad
  adjustAmount(increase) {
    const input = document.getElementById('modal-amount-input');
    if (!input || !window.STEP_VALUES) return;

    const currentValue = parseFloat(input.value) || 0;
    const step = window.STEP_VALUES[this.modalStepState.currentStepIndex];
    const stepValue = step ? step.value : 1;
    
    let newValue = increase ? currentValue + stepValue : currentValue - stepValue;
    newValue = Math.max(0, newValue);
    
    input.value = newValue.toFixed(2);
  }

  // Cambiar step
  cycleStep() {
    if (!window.STEP_VALUES) return;

    this.modalStepState.currentStepIndex = (this.modalStepState.currentStepIndex + 1) % window.STEP_VALUES.length;
    this.updateStepLabel();
  }

  // Actualizar label del step
  updateStepLabel() {
    const stepLabel = document.getElementById('modal-step-label');
    if (stepLabel && window.STEP_VALUES) {
      const currentStep = window.STEP_VALUES[this.modalStepState.currentStepIndex];
      if (currentStep) {
        stepLabel.textContent = currentStep.label;
      }
    }
  }

  // Crear combobox editable
  setupEditableCombobox(inputId, dropdownId, options) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) return;

    let currentOptions = options;
    let selectedIndex = -1;

    // Función para filtrar y mostrar opciones
    const showOptions = (filter = '') => {
      const filteredOptions = currentOptions.filter(option => 
        option.toLowerCase().includes(filter.toLowerCase())
      );

      if (filteredOptions.length === 0) {
        dropdown.classList.add('hidden');
        return;
      }

      dropdown.innerHTML = filteredOptions.map((option, index) => 
        `<div class="px-4 py-2 cursor-pointer text-slate-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" data-option="${option}" data-index="${index}">
          ${option}
        </div>`
      ).join('');

      dropdown.classList.remove('hidden');
      selectedIndex = -1;
    };

    // Función para ocultar dropdown
    const hideOptions = () => {
      dropdown.classList.add('hidden');
      selectedIndex = -1;
    };

    // Función para seleccionar opción
    const selectOption = (option) => {
      input.value = option;
      hideOptions();
    };

    // Eventos del input
    input.addEventListener('input', (e) => {
      showOptions(e.target.value);
    });

    input.addEventListener('focus', () => {
      if (currentOptions.length > 0) {
        showOptions(input.value);
      }
    });

    input.addEventListener('keydown', (e) => {
      const options = dropdown.querySelectorAll('[data-option]');
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
          this.updateSelection(options, selectedIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          this.updateSelection(options, selectedIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && options[selectedIndex]) {
            selectOption(options[selectedIndex].dataset.option);
          }
          break;
        case 'Escape':
          hideOptions();
          break;
      }
    });

    // Eventos del dropdown
    dropdown.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    dropdown.addEventListener('click', (e) => {
      const optionElement = e.target.closest('[data-option]');
      if (optionElement) {
        selectOption(optionElement.dataset.option);
      }
    });

    // Ocultar cuando se hace click fuera
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        hideOptions();
      }
    });
  }

  // Actualizar selección visual
  updateSelection(options, selectedIndex) {
    options.forEach((opt, index) => {
      if (index === selectedIndex) {
        opt.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50');
      } else {
        opt.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/50');
      }
    });
  }

  // Crear botones de opciones recientes
  createRecentButtons(containerId, options, targetInputId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = options.map(option => 
      `<button type="button" class="px-3 py-2 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" data-value="${option}">
        ${option}
      </button>`
    ).join('');

    // Agregar event listeners
    container.addEventListener('click', (e) => {
      const button = e.target.closest('[data-value]');
      if (button) {
        const input = document.getElementById(targetInputId);
        if (input) {
          input.value = button.dataset.value;
          input.focus();
        }
      }
    });
  }

  // Abrir modal
  async openModal() {
    // Copiar valor del input principal
    const mainInput = document.getElementById('numberInput');
    const modalInput = document.getElementById('modal-amount-input');
    if (mainInput && modalInput) {
      modalInput.value = mainInput.value;
    }

    // Establecer fecha y hora según filtro o actual
    const now = new Date();
    const dateInput = document.getElementById('save-date-input');
    const timeInput = document.getElementById('save-time-input');
    const monthInput = document.getElementById('save-month-input');
    const yearInput = document.getElementById('save-year-input');

    // Obtener mes y año del filtro actual
    const currentFilter = window.dateManager ? window.dateManager.getCurrentMonthYear() : null;
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Verificar si el filtro es diferente al mes/año actual
    const isDifferentFromCurrent = currentFilter && 
      (currentFilter.month !== currentMonth || currentFilter.year !== currentYear);

    if (isDifferentFromCurrent) {
      // Usar valores del filtro
      const filterMonth = currentFilter.month.toString().padStart(2, '0');
      const filterYear = currentFilter.year.toString();
      const filterDateString = `${filterYear}-${filterMonth}-01`;
      
      if (dateInput) {
        dateInput.value = filterDateString;
      }
      if (timeInput) {
        timeInput.value = '00:01';
      }
      if (monthInput) {
        monthInput.value = currentFilter.month.toString();
      }
      if (yearInput) {
        yearInput.value = currentFilter.year.toString();
      }
    } else {
      // Usar valores actuales
      if (dateInput) {
        dateInput.value = now.toISOString().split('T')[0];
      }
      if (timeInput) {
        timeInput.value = now.toTimeString().slice(0, 5);
      }
      if (monthInput) {
        monthInput.value = currentMonth.toString();
      }
      if (yearInput) {
        yearInput.value = currentYear.toString();
      }
    }

    // Cargar datos de la API
    await this.loadApiData();

    // Configurar comboboxes
    this.setupEditableCombobox('save-category-input', 'save-category-dropdown', this.allCategories);
    this.setupEditableCombobox('save-description-input', 'save-description-dropdown', this.allDescriptions);

    // Mostrar modal
    const modal = document.getElementById('save-transaction-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modalInput?.focus();
    }
  }

  // Cargar datos de la API
  async loadApiData() {
    if (window.apiService) {
      try {
        // Cargar todos los datos en paralelo
        const [allDescriptions, allCategories, lastDescriptions, lastCategories] = await Promise.all([
          window.apiService.getAllDescriptions(),
          window.apiService.getAllCategories(),
          window.apiService.getLastDescriptions(5),
          window.apiService.getLastCategories(5)
        ]);

        this.allDescriptions = allDescriptions;
        this.allCategories = allCategories;

        // Crear botones de opciones recientes
        this.createRecentButtons('recent-descriptions', lastDescriptions, 'save-description-input');
        this.createRecentButtons('recent-categories', lastCategories, 'save-category-input');

      } catch (error) {
        console.error('Error loading API data:', error);
      }
    }
  }

  // Cerrar modal
  closeModal() {
    const modal = document.getElementById('save-transaction-modal');
    if (modal) {
      modal.classList.add('hidden');
    }

    // Limpiar campos
    this.clearFields();
  }

  // Limpiar campos del formulario
  clearFields() {
    const fields = [
      'save-category-input',
      'save-description-input'
    ];

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = '';
      }
    });
  }

  // Guardar transacción
  async saveTransaction() {
    if (!window.apiService || this.isSaving) return;

    // Prevenir múltiples clicks
    this.isSaving = true;
    this.updateSaveButtonsState(true);

    // Recoger datos del formulario
    const description = document.getElementById('save-description-input').value.trim();
    const category = document.getElementById('save-category-input').value.trim();
    const rawAmount = parseFloat(document.getElementById('modal-amount-input').value);
    const isExpense = document.getElementById('is-expense-checkbox').checked;
    const date = document.getElementById('save-date-input').value;
    const time = document.getElementById('save-time-input').value;
    const month = parseInt(document.getElementById('save-month-input').value);
    const year = parseInt(document.getElementById('save-year-input').value);

    // Aplicar signo según si es gasto o ingreso
    const amount = isExpense ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    // Validar (ahora rawAmount debe ser > 0, no amount)
    if (!description || !category || rawAmount <= 0 || !date || !time || !month || !year) {
      alert(window.i18n.t('messages.fillAllFields'));
      this.isSaving = false;
      this.updateSaveButtonsState(false);
      return;
    }

    // Validar rangos
    if (month < 1 || month > 12) {
      alert(window.i18n.t('messages.invalidMonth'));
      this.isSaving = false;
      this.updateSaveButtonsState(false);
      return;
    }
    if (year < 1900 || year > 9999) {
      alert(window.i18n.t('messages.invalidYear'));
      this.isSaving = false;
      this.updateSaveButtonsState(false);
      return;
    }

    // Combinar fecha y hora
    const dateTime = `${date} ${time}:00`;
    
    // Preparar datos para la API
    const transactionData = {
      description,
      category,
      amount: amount.toString(),
      date: dateTime,
      month: month.toString(),
      year: year.toString()
    };

    try {
      // Llamar a la API para crear la transacción
      const result = await window.apiService.createTransaction(transactionData);
      
      if (result) {
        // Cerrar modal
        this.closeModal();
        
        // Resetear el input principal a 1.00
        const mainInput = document.getElementById('numberInput');
        if (mainInput) {
          mainInput.value = '1.00';
        }
        
        // Mostrar toast de éxito
        this.showSuccessToast();
        
        console.log('Transaction created successfully:', result);
        
      } else {
        alert(window.i18n.t('messages.errorCreating'));
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert(window.i18n.t('messages.errorSaving'));
    } finally {
      // Restaurar estado de los botones
      this.isSaving = false;
      this.updateSaveButtonsState(false);
    }
  }

  // Actualizar estado de los botones de guardar
  updateSaveButtonsState(disabled) {
    const confirmBtn = document.getElementById('confirm-save');
    const confirmHeaderBtn = document.getElementById('confirm-save-header');
    
    [confirmBtn, confirmHeaderBtn].forEach(btn => {
      if (btn) {
        btn.disabled = disabled;
        if (disabled) {
          btn.classList.add('opacity-50', 'cursor-not-allowed');
          btn.textContent = window.i18n ? window.i18n.t('buttons.saving') : 'Guardando...';
        } else {
          btn.classList.remove('opacity-50', 'cursor-not-allowed');
          btn.textContent = window.i18n ? window.i18n.t('buttons.save') : 'Guardar';
        }
      }
    });
  }

  // Mostrar toast de éxito
  showSuccessToast() {
    const toast = document.querySelector('#toast > div');
    if (toast) {
      toast.classList.remove('hidden');
      toast.classList.add('flex');
      
      // Auto ocultar después de 2 segundos
      setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
      }, 2000);
    }
  }
}

// Instancia global
window.homeSaveModal = new HomeSaveModal();

// Función de inicialización
function initHomeSaveModal() {
  if (window.homeSaveModal) {
    window.homeSaveModal.init();
  }
}

window.initHomeSaveModal = initHomeSaveModal;

export default window.homeSaveModal;