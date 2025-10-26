// === Vista mensual ===

class MonthView {
  constructor() {
    this.expenses = [];
    this.editStepState = { currentStepIndex: 1 }; // Para el editor de cantidad
    this.descriptionsCache = [];
    this.categoriesCache = [];
  }

  // Cargar datos desde la API
  async loadExpensesFromAPI() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    
    if (window.apiService) {
      try {
        console.log(`Loading expenses for ${month}/${year} from API...`);
        this.expenses = await window.apiService.getMonthData(month, year);
        console.log(`Loaded ${this.expenses.length} transactions from API`);
        return;
      } catch (error) {
        console.error('Failed to load from API:', error);
      }
    }
    
    // Si no hay API o falla, lista vacía
    this.expenses = [];
  }


  // Formatear fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }

  // Obtener nombre de categoría
  getCategoryName(category) {
    // Devolver la categoría tal como viene de la API
    // Si está vacía o es null/undefined, mostrar "Sin categoría"
    if (!category || category.trim() === '') {
      return window.i18n ? window.i18n.t('messages.noCategory') : 'Sin categoría';
    }
    return category;
  }

  // Formatear moneda usando el selector de moneda actual
  formatCurrency(amount) {
    if (window.currencySelector && window.currencySelector.formatCurrency) {
      return window.currencySelector.formatCurrency(amount);
    }
    
    // Fallback usando localStorage directamente
    const savedCurrency = localStorage.getItem('spendtap-currency') || 'EUR';
    if (savedCurrency === 'EUR') {
      return `${amount.toFixed(2)}€`;
    } else if (savedCurrency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else if (savedCurrency === 'GBP') {
      return `£${amount.toFixed(2)}`;
    }
    
    // Fallback final al euro
    return `${amount.toFixed(2)}€`;
  }

  // Renderizar lista de gastos e ingresos
  renderExpensesList() {
    const container = document.getElementById('expenses-list');
    if (!container) return;

    container.innerHTML = this.expenses.map((item, index) => `
      <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" data-transaction-index="${index}">
        <div class="flex-1 min-w-0 pr-4">
          <div class="flex items-center justify-between mb-1">
            <p class="font-medium text-slate-900 dark:text-slate-100 truncate">${item.description}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">${this.formatDate(item.date)}</p>
          </div>
          <div class="flex items-center justify-between">
            <span class="inline-block px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full truncate max-w-32">${this.getCategoryName(item.category)}</span>
            <p class="font-bold text-lg ${item.type === 'income' ? 'text-green-600' : 'text-red-600'} flex-shrink-0">
              ${item.type === 'income' ? '+' : ''}${this.formatCurrency(item.amount)}
            </p>
          </div>
        </div>
      </div>
    `).join('');

    // Añadir event listeners para abrir modal
    this.addClickHandlers();
  }

  // Añadir event listeners a los elementos de la lista
  addClickHandlers() {
    const transactionElements = document.querySelectorAll('[data-transaction-index]');
    transactionElements.forEach(element => {
      element.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.transactionIndex);
        const transaction = this.expenses[index];
        if (transaction) {
          this.openTransactionModal(transaction);
        }
      });
    });
  }

  // Abrir modal con detalles de la transacción
  openTransactionModal(transaction) {
    // Guardar referencia para eliminación
    this.currentTransaction = transaction;
    
    // Asegurar que siempre se abra en modo vista
    this.resetToViewMode();
    
    // Rellenar datos del modal
    document.getElementById('modal-description').textContent = transaction.description;
    document.getElementById('modal-category').textContent = this.getCategoryName(transaction.category);
    document.getElementById('modal-id').textContent = transaction.id;
    
    // Formatear fecha completa
    const fullDate = new Date(transaction.date);
    const dateString = fullDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    document.getElementById('modal-date').textContent = dateString;
    
    // Cantidad con color
    const amountElement = document.getElementById('modal-amount');
    const sign = transaction.type === 'income' ? '+' : '';
    const color = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
    amountElement.textContent = `${sign}${this.formatCurrency(transaction.amount)}`;
    amountElement.className = `mt-1 text-2xl font-bold ${color}`;
    
    // Tipo
    const typeElement = document.getElementById('modal-type');
    const typeText = transaction.type === 'income' ? 'Ingreso' : 'Gasto';
    const typeColor = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
    typeElement.textContent = typeText;
    typeElement.className = `mt-1 text-sm font-medium ${typeColor}`;
    
    // Mostrar modal
    const modal = document.getElementById('transaction-modal');
    modal.classList.remove('hidden');
    
    // Focus trap - enfocar el botón de cerrar
    const closeButton = document.getElementById('close-modal');
    if (closeButton) {
      closeButton.focus();
    }
  }

  // Resetear al modo vista
  resetToViewMode() {
    document.getElementById('modal-edit').classList.add('hidden');
    document.getElementById('modal-view').classList.remove('hidden');
  }

  // Cerrar modal
  closeTransactionModal() {
    const modal = document.getElementById('transaction-modal');
    modal.classList.add('hidden');
  }

  // Calcular y mostrar resumen
  renderSummary() {
    const expenses = this.expenses.filter(item => item.type === 'expense');
    const incomes = this.expenses.filter(item => item.type === 'income');
    
    // Asegurar que los gastos sean siempre positivos para el cálculo
    const totalExpenses = expenses.reduce((sum, expense) => sum + Math.abs(expense.amount), 0);
    const totalIncome = incomes.reduce((sum, income) => sum + Math.abs(income.amount), 0);
    const balance = totalIncome - totalExpenses;

    console.log('Summary calculation:', {
      totalExpenses,
      totalIncome,
      balance,
      expensesCount: expenses.length,
      incomesCount: incomes.length
    });

    const totalExpensesElement = document.getElementById('total-expenses');
    const totalIncomeElement = document.getElementById('total-income');
    const totalBalanceElement = document.getElementById('total-balance');

    if (totalExpensesElement) {
      totalExpensesElement.textContent = this.formatCurrency(totalExpenses);
    }
    if (totalIncomeElement) {
      totalIncomeElement.textContent = this.formatCurrency(totalIncome);
    }
    if (totalBalanceElement) {
      totalBalanceElement.textContent = this.formatCurrency(balance);
      // Color dinámico según el balance
      if (balance > 0) {
        totalBalanceElement.className = 'text-xl font-bold text-green-600';
      } else if (balance < 0) {
        totalBalanceElement.className = 'text-xl font-bold text-red-600';
      } else {
        totalBalanceElement.className = 'text-xl font-bold text-slate-700 dark:text-slate-300';
      }
    }
  }

  // Inicializar vista mensual
  async init() {
    // Mostrar indicador de carga
    const container = document.getElementById('expenses-list');
    if (container) {
      container.innerHTML = '<div class="text-center py-8 text-slate-500">Cargando...</div>';
    }

    // Cargar datos
    await this.loadExpensesFromAPI();
    
    // Renderizar
    this.renderExpensesList();
    this.renderSummary();

    // Configurar botón volver
    const backBtn = document.getElementById('backToHomeBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (window.loadPage) {
          // Mantener los parámetros actuales de la URL
          const currentUrl = new URL(window.location);
          const month = currentUrl.searchParams.get('month');
          const year = currentUrl.searchParams.get('year');
          
          const newUrl = new URL(window.location.origin);
          newUrl.pathname = '/';
          
          if (month) newUrl.searchParams.set('month', month);
          if (year) newUrl.searchParams.set('year', year);
          
          window.history.pushState({}, '', newUrl.toString());
          window.loadPage('home');
        }
      });
    }

    // Configurar botones de cerrar modal
    this.setupModalCloseHandlers();
  }

  // Configurar event listeners para cerrar modal
  setupModalCloseHandlers() {
    const modal = document.getElementById('transaction-modal');
    const confirmModal = document.getElementById('delete-confirm-modal');
    const closeButton = document.getElementById('close-modal');
    const deleteButton = document.getElementById('delete-transaction');
    const editButton = document.getElementById('edit-transaction');
    const cancelDeleteButton = document.getElementById('cancel-delete');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelEditButton = document.getElementById('cancel-edit');
    const saveEditButton = document.getElementById('save-edit');
    
    // Cerrar modal principal con botón X
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.closeTransactionModal();
      });
    }
    
    // Cerrar modal principal al hacer click en el fondo
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeTransactionModal();
        }
      });
    }
    
    // Abrir modal de confirmación de eliminación
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.openDeleteConfirmModal();
      });
    }
    
    // Abrir modo edición
    if (editButton) {
      editButton.addEventListener('click', () => {
        this.openEditMode();
      });
    }
    
    // Cancelar eliminación
    if (cancelDeleteButton) {
      cancelDeleteButton.addEventListener('click', () => {
        this.closeDeleteConfirmModal();
      });
    }
    
    // Confirmar eliminación
    if (confirmDeleteButton) {
      confirmDeleteButton.addEventListener('click', () => {
        this.deleteTransaction();
      });
    }
    
    // Cancelar edición
    if (cancelEditButton) {
      cancelEditButton.addEventListener('click', () => {
        this.closeEditMode();
      });
    }
    
    // Guardar edición
    if (saveEditButton) {
      saveEditButton.addEventListener('click', () => {
        this.saveTransaction();
      });
    }
    
    // Cerrar modal de confirmación al hacer click en el fondo
    if (confirmModal) {
      confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
          this.closeDeleteConfirmModal();
        }
      });
    }
    
    // Configurar botones de edición de cantidad
    this.setupEditAmountHandlers();
    
    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!confirmModal.classList.contains('hidden')) {
          this.closeDeleteConfirmModal();
        } else if (!modal.classList.contains('hidden')) {
          this.closeTransactionModal();
        }
      }
    });
  }

  // Abrir modal de confirmación de eliminación
  openDeleteConfirmModal() {
    const confirmModal = document.getElementById('delete-confirm-modal');
    confirmModal.classList.remove('hidden');
    
    // Focus en botón cancelar
    const cancelButton = document.getElementById('cancel-delete');
    if (cancelButton) {
      cancelButton.focus();
    }
  }

  // Cerrar modal de confirmación de eliminación
  closeDeleteConfirmModal() {
    const confirmModal = document.getElementById('delete-confirm-modal');
    confirmModal.classList.add('hidden');
  }

  // Eliminar transacción
  async deleteTransaction() {
    if (!this.currentTransaction || !window.apiService) {
      return;
    }

    try {
      // Llamar a la API para eliminar
      const success = await window.apiService.deleteTransaction(this.currentTransaction.id);
      
      if (success) {
        // Cerrar ambos modales
        this.closeDeleteConfirmModal();
        this.closeTransactionModal();
        
        // Recargar datos
        await this.loadExpensesFromAPI();
        this.renderExpensesList();
        this.renderSummary();
        
        // Mostrar mensaje de éxito
        console.log('Transaction deleted successfully');
      } else {
        console.error('Failed to delete transaction');
        // TODO: Mostrar mensaje de error al usuario
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // TODO: Mostrar mensaje de error al usuario
    }
  }

  // Abrir modo edición
  async openEditMode() {
    // Cargar datos de API para dropdowns
    await this.loadEditData();
    
    // Llenar campos del formulario con datos actuales
    this.populateEditForm();
    
    // Cambiar vista
    document.getElementById('modal-view').classList.add('hidden');
    document.getElementById('modal-edit').classList.remove('hidden');
  }

  // Cerrar modo edición
  closeEditMode() {
    this.resetToViewMode();
  }

  // Cargar datos para los dropdowns
  async loadEditData() {
    if (window.apiService) {
      try {
        this.descriptionsCache = await window.apiService.getAllDescriptions();
        this.categoriesCache = await window.apiService.getAllCategories();
        
        // Configurar comboboxes editables
        this.setupEditableCombobox('edit-description', 'edit-description-dropdown', this.descriptionsCache);
        this.setupEditableCombobox('edit-category', 'edit-category-dropdown', this.categoriesCache);
      } catch (error) {
        console.error('Error loading edit data:', error);
      }
    }
  }

  // Crear combobox editable personalizado
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
          updateSelection(options);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          updateSelection(options);
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

    // Función para actualizar selección visual
    const updateSelection = (options) => {
      options.forEach((opt, index) => {
        if (index === selectedIndex) {
          opt.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50');
        } else {
          opt.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/50');
        }
      });
    };

    // Eventos del dropdown
    dropdown.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevenir que el input pierda el foco
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

  // Llenar formulario con datos actuales
  populateEditForm() {
    if (!this.currentTransaction) return;

    const transaction = this.currentTransaction;
    
    // Descripción y categoría
    document.getElementById('edit-description').value = transaction.description || '';
    document.getElementById('edit-category').value = transaction.category || '';
    
    // Cantidad
    document.getElementById('edit-amount').value = Math.abs(transaction.amount).toFixed(2);
    
    // Fecha y hora
    const date = new Date(transaction.date);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().slice(0, 5);
    
    document.getElementById('edit-date').value = dateStr;
    document.getElementById('edit-time').value = timeStr;
    
    // Mes y año
    document.getElementById('edit-month').value = (date.getMonth() + 1).toString();
    document.getElementById('edit-year').value = date.getFullYear().toString();
    
    // Actualizar step label
    this.updateEditStepLabel();
  }

  // Configurar handlers para edición de cantidad
  setupEditAmountHandlers() {
    const minusBtn = document.getElementById('edit-minus-btn');
    const plusBtn = document.getElementById('edit-plus-btn');
    const stepBtn = document.getElementById('edit-step-btn');
    
    if (minusBtn) {
      minusBtn.addEventListener('click', () => this.adjustEditAmount(false));
    }
    if (plusBtn) {
      plusBtn.addEventListener('click', () => this.adjustEditAmount(true));
    }
    if (stepBtn) {
      stepBtn.addEventListener('click', () => this.cycleEditStep());
    }
  }

  // Ajustar cantidad en modo edición
  adjustEditAmount(increase) {
    const input = document.getElementById('edit-amount');
    if (!input || !window.STEP_VALUES) return;

    const currentValue = parseFloat(input.value) || 0;
    const step = window.STEP_VALUES[this.editStepState.currentStepIndex];
    const stepValue = step ? step.value : 1;
    
    let newValue = increase ? currentValue + stepValue : currentValue - stepValue;
    newValue = Math.max(0, newValue);
    
    input.value = newValue.toFixed(2);
  }

  // Cambiar step en modo edición
  cycleEditStep() {
    if (!window.STEP_VALUES) return;

    this.editStepState.currentStepIndex = (this.editStepState.currentStepIndex + 1) % window.STEP_VALUES.length;
    this.updateEditStepLabel();
  }

  // Actualizar label del step en edición
  updateEditStepLabel() {
    const stepLabel = document.getElementById('edit-step-label');
    if (stepLabel && window.STEP_VALUES) {
      const currentStep = window.STEP_VALUES[this.editStepState.currentStepIndex];
      if (currentStep) {
        stepLabel.textContent = currentStep.label;
      }
    }
  }

  // Guardar transacción editada
  async saveTransaction() {
    if (!this.currentTransaction || !window.apiService) return;

    // Recoger datos del formulario
    const description = document.getElementById('edit-description').value.trim();
    const category = document.getElementById('edit-category').value.trim();
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const month = parseInt(document.getElementById('edit-month').value);
    const year = parseInt(document.getElementById('edit-year').value);
    
    // Validar
    if (!description || amount <= 0 || !date || !time || !month || !year) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    // Validar rangos
    if (month < 1 || month > 12) {
      alert('El mes debe estar entre 1 y 12.');
      return;
    }
    if (year < 1900 || year > 9999) {
      alert('El año debe estar entre 1900 y 9999.');
      return;
    }

    // Combinar fecha y hora
    const dateTime = `${date} ${time}:00`;
    
    // Preparar datos para la API
    const updateData = {
      description,
      category,
      amount: amount.toString(),
      date: dateTime,
      month: month.toString(),
      year: year.toString()
    };

    try {
      // Llamar a la API
      const result = await window.apiService.editTransaction(this.currentTransaction.id, updateData);
      
      if (result) {
        // Cerrar modal
        this.closeEditMode();
        this.closeTransactionModal();
        
        // Recargar datos
        await this.loadExpensesFromAPI();
        this.renderExpensesList();
        this.renderSummary();
        
        console.log('Transaction updated successfully');
      } else {
        alert('Error al actualizar la transacción.');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar los cambios.');
    }
  }
}

// Instancia global
window.monthView = new MonthView();

// Función de inicialización
function initMonthView() {
  if (window.monthView) {
    window.monthView.init();
  }
}

window.initMonthView = initMonthView;

export default window.monthView;