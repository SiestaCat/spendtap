// === Vista de desglose anual ===

class YearlyBreakdownView {
  constructor() {
    this.yearlyTransactions = [];
    this.categoryBreakdown = [];
    this.descriptionBreakdown = [];
    this.yearSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0
    };
    this.endBalance = 0;
    this.allCategories = []; // Para el filtro
    this.selectedCategories = []; // Categorías seleccionadas para filtrar
  }

  // Inicializar vista
  async init() {
    // Cargar datos
    await this.loadYearlyData();
    
    // Renderizar resumen y desgloses
    this.renderYearSummary();
    this.renderEndBalance();
    this.renderCategoryBreakdown();
    this.renderDescriptionBreakdown();
    
    // Configurar navegación
    this.setupNavigation();
    
    // Configurar filtro por categorías
    await this.setupCategoryFilter();
    
    // Actualizar período mostrado
    this.updatePeriod();
    
    // Actualizar labels de navegación después de cargar todo
    this.updateNavigationLabels();
  }

  // Cargar datos anuales desde la API
  async loadYearlyData() {
    const { year } = window.dateManager.getCurrentMonthYear();
    
    if (window.apiService) {
      try {
        console.log(`Loading yearly breakdown data for ${year}...`);
        
        const categories = this.selectedCategories.length > 0 ? this.selectedCategories : [];
        
        if (categories.length > 0) {
          // Si hay filtros de categoría, cargar transacciones de todos los meses y calcular
          console.log('Loading filtered transactions for yearly breakdown calculation...');
          
          // Cargar datos de todos los meses del año con filtros
          const promises = [];
          for (let month = 1; month <= 12; month++) {
            promises.push(window.apiService.getMonthData(month, year, categories));
          }
          
          const monthsData = await Promise.all(promises);
          this.yearlyTransactions = monthsData.flat();
          
          // Calcular desgloses y resumen desde transacciones filtradas
          this.calculateYearlyBreakdowns();
          this.calculateYearSummary();
          
          // Balance no se puede filtrar por categoría, usar balance completo
          const balanceData = await window.apiService.getBalance(12, year);
          if (balanceData) {
            this.endBalance = parseFloat(balanceData.balance || 0);
          }
        } else {
          // Sin filtros, usar endpoints optimizados de breakdown
          const [yearData, categoryData, descriptionData, balanceData] = await Promise.all([
            window.apiService.getYearBreakdown(year),
            window.apiService.getCategoryBreakdownYear(year),
            window.apiService.getDescriptionBreakdownYear(year),
            window.apiService.getBalance(12, year)
          ]);
          
          // Procesar datos del resumen anual
          if (yearData) {
            this.yearSummary = {
              totalIncome: Math.abs(parseFloat(yearData.income_amount || 0)),
              totalExpenses: Math.abs(parseFloat(yearData.expense_amount || 0)),
              balance: parseFloat(yearData.total || 0)
            };
          }
          
          // Procesar datos del desglose por categoría
          if (categoryData && categoryData.breakdown) {
            this.categoryBreakdown = categoryData.breakdown.map(item => ({
              category: item.category || 'Sin categoría',
              count: parseInt(item.entry_count || 0),
              totalAmount: Math.abs(parseFloat(item.total || 0)),
              expenses: Math.abs(parseFloat(item.expense_amount || 0)),
              income: Math.abs(parseFloat(item.income_amount || 0)),
              sortValue: Math.abs(parseFloat(item.total || 0))
            })).sort((a, b) => b.sortValue - a.sortValue);
          }
          
          // Procesar datos del desglose por descripción
          if (descriptionData && descriptionData.breakdown) {
            this.descriptionBreakdown = descriptionData.breakdown.map(item => ({
              description: item.description || 'Sin descripción',
              count: parseInt(item.entry_count || 0),
              totalAmount: Math.abs(parseFloat(item.total || 0)),
              expenses: Math.abs(parseFloat(item.expense_amount || 0)),
              income: Math.abs(parseFloat(item.income_amount || 0)),
              category: item.category || 'Sin categoría',
              sortValue: Math.abs(parseFloat(item.total || 0))
            })).sort((a, b) => b.sortValue - a.sortValue);
          }
          
          // Procesar datos del balance
          if (balanceData) {
            this.endBalance = parseFloat(balanceData.balance || 0);
          }
        }
        
        console.log('Yearly breakdown data loaded from API successfully');
      } catch (error) {
        console.error('Failed to load yearly breakdown data:', error);
        // Fallback a valores vacíos
        this.yearSummary = { totalIncome: 0, totalExpenses: 0, balance: 0 };
        this.categoryBreakdown = [];
        this.descriptionBreakdown = [];
        this.endBalance = 0;
      }
    }
  }

  // Calcular resumen anual desde transacciones
  calculateYearSummary() {
    this.yearSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0
    };

    this.yearlyTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        this.yearSummary.totalExpenses += Math.abs(transaction.amount);
      } else if (transaction.type === 'income') {
        this.yearSummary.totalIncome += Math.abs(transaction.amount);
      }
    });

    this.yearSummary.balance = this.yearSummary.totalIncome - this.yearSummary.totalExpenses;
  }

  // Calcular desgloses por categoría y descripción (anual) desde transacciones
  calculateYearlyBreakdowns() {
    // Desglose por categoría
    const categoryMap = new Map();
    
    this.yearlyTransactions.forEach(transaction => {
      const category = transaction.category || 'Sin categoría';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          count: 0,
          totalAmount: 0,
          expenses: 0,
          income: 0
        });
      }
      
      const data = categoryMap.get(category);
      data.count++;
      
      if (transaction.type === 'expense') {
        data.expenses += Math.abs(transaction.amount);
        data.totalAmount += Math.abs(transaction.amount);
      } else {
        data.income += Math.abs(transaction.amount);
        data.totalAmount += Math.abs(transaction.amount);
      }
    });
    
    // Convertir a array y ordenar por cantidad total
    this.categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);

    // Desglose por descripción
    const descriptionMap = new Map();
    
    this.yearlyTransactions.forEach(transaction => {
      const description = transaction.description || 'Sin descripción';
      
      if (!descriptionMap.has(description)) {
        descriptionMap.set(description, {
          description,
          count: 0,
          totalAmount: 0,
          expenses: 0,
          income: 0,
          category: transaction.category || 'Sin categoría'
        });
      }
      
      const data = descriptionMap.get(description);
      data.count++;
      
      if (transaction.type === 'expense') {
        data.expenses += Math.abs(transaction.amount);
        data.totalAmount += Math.abs(transaction.amount);
      } else {
        data.income += Math.abs(transaction.amount);
        data.totalAmount += Math.abs(transaction.amount);
      }
    });
    
    // Convertir a array y ordenar por cantidad total
    this.descriptionBreakdown = Array.from(descriptionMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }


  // Formatear moneda
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
    
    return `${amount.toFixed(2)}€`;
  }

  // Renderizar resumen anual
  renderYearSummary() {
    const totalIncomeElement = document.getElementById('yearly-total-income');
    const totalExpensesElement = document.getElementById('yearly-total-expenses');
    const totalBalanceElement = document.getElementById('yearly-total-balance');

    if (totalIncomeElement) {
      totalIncomeElement.textContent = this.formatCurrency(this.yearSummary.totalIncome);
    }
    if (totalExpensesElement) {
      totalExpensesElement.textContent = this.formatCurrency(this.yearSummary.totalExpenses);
    }
    if (totalBalanceElement) {
      totalBalanceElement.textContent = this.formatCurrency(this.yearSummary.balance);
      
      // Color dinámico según el balance
      if (this.yearSummary.balance > 0) {
        totalBalanceElement.className = 'text-xl font-bold text-green-600';
      } else if (this.yearSummary.balance < 0) {
        totalBalanceElement.className = 'text-xl font-bold text-red-600';
      } else {
        totalBalanceElement.className = 'text-xl font-bold text-slate-700 dark:text-slate-300';
      }
    }
  }

  // Renderizar balance al final del año
  renderEndBalance() {
    const endBalanceElement = document.getElementById('yearly-end-balance');

    if (endBalanceElement) {
      endBalanceElement.textContent = this.formatCurrency(this.endBalance);
      
      // Color dinámico según el balance
      if (this.endBalance > 0) {
        endBalanceElement.className = 'text-2xl font-bold text-green-600';
      } else if (this.endBalance < 0) {
        endBalanceElement.className = 'text-2xl font-bold text-red-600';
      } else {
        endBalanceElement.className = 'text-2xl font-bold text-slate-700 dark:text-slate-300';
      }
    }
  }

  // Renderizar desglose anual por categorías
  renderCategoryBreakdown() {
    const container = document.getElementById('yearly-category-breakdown');
    if (!container) return;

    if (this.categoryBreakdown.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-slate-500">
          <p data-i18n="breakdown.noData">No hay datos disponibles</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.categoryBreakdown.map(item => `
      <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-slate-900 dark:text-slate-100 truncate">
              ${item.category}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              ${item.count} ${item.count === 1 ? window.i18n?.t('breakdown.transaction') || 'transacción' : window.i18n?.t('breakdown.transactions') || 'transacciones'}
            </p>
          </div>
          <div class="text-right">
            <p class="font-bold text-lg text-slate-900 dark:text-slate-100">
              ${this.formatCurrency(item.totalAmount)}
            </p>
          </div>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-red-600">
            Gastos: ${this.formatCurrency(item.expenses)}
          </span>
          <span class="text-green-600">
            Ingresos: ${this.formatCurrency(item.income)}
          </span>
        </div>
      </div>
    `).join('');
  }

  // Renderizar desglose anual por descripciones
  renderDescriptionBreakdown() {
    const container = document.getElementById('yearly-description-breakdown');
    if (!container) return;

    if (this.descriptionBreakdown.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-slate-500">
          <p data-i18n="breakdown.noData">No hay datos disponibles</p>
        </div>
      `;
      return;
    }

    // Mostrar solo los top 20 para no sobrecargar la vista
    const topDescriptions = this.descriptionBreakdown.slice(0, 20);

    container.innerHTML = topDescriptions.map(item => `
      <div class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-slate-900 dark:text-slate-100 truncate">
              ${item.description}
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              ${item.category} • ${item.count} ${item.count === 1 ? window.i18n?.t('breakdown.transaction') || 'transacción' : window.i18n?.t('breakdown.transactions') || 'transacciones'}
            </p>
          </div>
          <div class="text-right">
            <p class="font-bold text-lg text-slate-900 dark:text-slate-100">
              ${this.formatCurrency(item.totalAmount)}
            </p>
          </div>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-red-600">
            Gastos: ${this.formatCurrency(item.expenses)}
          </span>
          <span class="text-green-600">
            Ingresos: ${this.formatCurrency(item.income)}
          </span>
        </div>
      </div>
    `).join('');

    // Agregar indicador si hay más elementos
    if (this.descriptionBreakdown.length > 20) {
      container.innerHTML += `
        <div class="p-4 text-center text-slate-500 border-t border-slate-200 dark:border-slate-700">
          <p class="text-sm">
            Mostrando top 20 de ${this.descriptionBreakdown.length} descripciones
          </p>
        </div>
      `;
    }
  }

  // Actualizar período mostrado
  updatePeriod() {
    const { year } = window.dateManager.getCurrentMonthYear();
    const periodElement = document.getElementById('yearly-breakdown-period');
    
    if (periodElement) {
      periodElement.textContent = year.toString();
    }
  }

  // Configurar navegación
  setupNavigation() {
    // Botón volver al desglose mensual
    const backToBreakdownBtn = document.getElementById('backToBreakdownBtn');
    if (backToBreakdownBtn) {
      backToBreakdownBtn.addEventListener('click', () => {
        if (window.loadPage && window.dateManager) {
          const { month, year } = window.dateManager.getCurrentMonthYear();
          const url = new URL(window.location);
          url.pathname = '/breakdown';
          url.searchParams.set('month', month);
          url.searchParams.set('year', year);
          window.history.pushState({}, '', url.toString());
          window.loadPage('breakdown');
        }
      });
    }

    // Configurar navegación por años
    this.setupYearNavigation();
  }

  // Configurar navegación por años
  setupYearNavigation() {
    const prevYearBtn = document.getElementById('yearly-prevYearBtn');
    const nextYearBtn = document.getElementById('yearly-nextYearBtn');

    if (prevYearBtn) {
      prevYearBtn.addEventListener('click', () => {
        this.navigateToPreviousYear();
      });
    }

    if (nextYearBtn) {
      nextYearBtn.addEventListener('click', () => {
        this.navigateToNextYear();
      });
    }

    // Actualizar labels de navegación
    this.updateNavigationLabels();
  }

  // Funciones de navegación específicas para yearly breakdown
  navigateToPreviousYear() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    this.navigateToDate(month, year - 1);
  }

  navigateToNextYear() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    this.navigateToDate(month, year + 1);
  }

  // Navegar a fecha específica
  async navigateToDate(month, year) {
    // Actualizar URL
    const url = new URL(window.location);
    url.searchParams.set('month', month);
    url.searchParams.set('year', year);
    window.history.pushState({}, '', url.toString());

    // Recargar datos y vista
    await this.loadYearlyData();
    this.renderYearSummary();
    this.renderEndBalance();
    this.renderCategoryBreakdown();
    this.renderDescriptionBreakdown();
    this.updatePeriod();
    this.updateNavigationLabels();
  }

  // Actualizar labels de navegación
  updateNavigationLabels() {
    const { year } = window.dateManager.getCurrentMonthYear();
    
    const prevYearLabel = document.getElementById('yearly-prevYearLabel');
    const nextYearLabel = document.getElementById('yearly-nextYearLabel');

    if (prevYearLabel) {
      prevYearLabel.textContent = year - 1;
    }

    if (nextYearLabel) {
      nextYearLabel.textContent = year + 1;
    }
  }

  // Configurar filtro por categorías (yearly)
  async setupCategoryFilter() {
    const filterInput = document.getElementById('yearly-category-filter-input');
    const filterDropdown = document.getElementById('yearly-category-filter-dropdown');
    const clearFiltersBtn = document.getElementById('yearly-clear-filters-btn');
    const selectedCategoriesDiv = document.getElementById('yearly-selected-categories');

    if (!filterInput || !filterDropdown) return;

    // Cargar todas las categorías disponibles
    await this.loadAllCategories();

    let selectedIndex = -1;

    // Función para mostrar opciones en el dropdown
    const showOptions = (filter = '') => {
      const filteredOptions = this.allCategories.filter(category => 
        category.toLowerCase().includes(filter.toLowerCase()) &&
        !this.selectedCategories.includes(category)
      );

      if (filteredOptions.length === 0) {
        filterDropdown.classList.add('hidden');
        return;
      }

      filterDropdown.innerHTML = filteredOptions.map((category, index) => 
        `<div class="px-4 py-2 cursor-pointer text-slate-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors" data-category="${category}" data-index="${index}">
          ${category}
        </div>`
      ).join('');

      filterDropdown.classList.remove('hidden');
      selectedIndex = -1;
    };

    // Función para ocultar dropdown
    const hideOptions = () => {
      filterDropdown.classList.add('hidden');
      selectedIndex = -1;
    };

    // Función para seleccionar categoría
    const selectCategory = (category) => {
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
        this.renderSelectedCategories();
        this.applyFilters();
      }
      filterInput.value = '';
      hideOptions();
    };

    // Eventos del input
    filterInput.addEventListener('input', (e) => {
      showOptions(e.target.value);
    });

    filterInput.addEventListener('focus', () => {
      if (this.allCategories.length > 0) {
        showOptions(filterInput.value);
      }
    });

    filterInput.addEventListener('keydown', (e) => {
      const options = filterDropdown.querySelectorAll('[data-category]');
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
          this.updateFilterSelection(options, selectedIndex);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          this.updateFilterSelection(options, selectedIndex);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && options[selectedIndex]) {
            selectCategory(options[selectedIndex].dataset.category);
          }
          break;
        case 'Escape':
          hideOptions();
          break;
      }
    });

    // Eventos del dropdown
    filterDropdown.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    filterDropdown.addEventListener('click', (e) => {
      const categoryElement = e.target.closest('[data-category]');
      if (categoryElement) {
        selectCategory(categoryElement.dataset.category);
      }
    });

    // Ocultar cuando se hace click fuera
    document.addEventListener('click', (e) => {
      if (!filterInput.contains(e.target) && !filterDropdown.contains(e.target)) {
        hideOptions();
      }
    });

    // Botón para limpiar filtros
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearAllFilters();
      });
    }
  }

  // Cargar todas las categorías disponibles
  async loadAllCategories() {
    if (window.apiService) {
      try {
        this.allCategories = await window.apiService.getAllCategories();
      } catch (error) {
        console.error('Error loading categories for filter:', error);
        this.allCategories = [];
      }
    }
  }

  // Actualizar selección visual en el dropdown de filtro
  updateFilterSelection(options, selectedIndex) {
    options.forEach((opt, index) => {
      if (index === selectedIndex) {
        opt.classList.add('bg-indigo-100', 'dark:bg-indigo-900/50');
      } else {
        opt.classList.remove('bg-indigo-100', 'dark:bg-indigo-900/50');
      }
    });
  }

  // Renderizar categorías seleccionadas
  renderSelectedCategories() {
    const selectedCategoriesDiv = document.getElementById('yearly-selected-categories');
    const clearFiltersBtn = document.getElementById('yearly-clear-filters-btn');

    if (!selectedCategoriesDiv) return;

    if (this.selectedCategories.length === 0) {
      selectedCategoriesDiv.classList.add('hidden');
      if (clearFiltersBtn) clearFiltersBtn.classList.add('hidden');
      return;
    }

    selectedCategoriesDiv.classList.remove('hidden');
    if (clearFiltersBtn) clearFiltersBtn.classList.remove('hidden');

    selectedCategoriesDiv.innerHTML = this.selectedCategories.map(category => 
      `<span class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
        ${category}
        <button type="button" class="ml-1 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300" data-remove-category="${category}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </span>`
    ).join('');

    // Event listeners para remover categorías
    selectedCategoriesDiv.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-category]');
      if (removeBtn) {
        const category = removeBtn.dataset.removeCategory;
        this.removeCategoryFilter(category);
      }
    });
  }

  // Remover una categoría del filtro
  removeCategoryFilter(category) {
    this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
    this.renderSelectedCategories();
    this.applyFilters();
  }

  // Limpiar todos los filtros
  clearAllFilters() {
    this.selectedCategories = [];
    this.renderSelectedCategories();
    this.applyFilters();
  }

  // Aplicar filtros (recargar datos)
  async applyFilters() {
    // Mostrar indicador de carga
    const categoryContainer = document.getElementById('yearly-category-breakdown');
    const descriptionContainer = document.getElementById('yearly-description-breakdown');
    
    if (categoryContainer) {
      categoryContainer.innerHTML = '<div class="p-4 text-center text-slate-500">Cargando...</div>';
    }
    if (descriptionContainer) {
      descriptionContainer.innerHTML = '<div class="p-4 text-center text-slate-500">Cargando...</div>';
    }

    // Cargar datos con filtros aplicados
    await this.loadYearlyData();
    this.renderYearSummary();
    this.renderEndBalance();
    this.renderCategoryBreakdown();
    this.renderDescriptionBreakdown();
  }
}

// Instancia global
window.yearlyBreakdownView = new YearlyBreakdownView();

// Función de inicialización
function initYearlyBreakdown() {
  if (window.yearlyBreakdownView) {
    window.yearlyBreakdownView.init();
  }
}

window.initYearlyBreakdown = initYearlyBreakdown;

export default window.yearlyBreakdownView;