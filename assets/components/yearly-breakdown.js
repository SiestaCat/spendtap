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
    
    // Actualizar período mostrado
    this.updatePeriod();
  }

  // Cargar datos anuales desde la API
  async loadYearlyData() {
    const { year } = window.dateManager.getCurrentMonthYear();
    
    if (window.apiService) {
      try {
        console.log(`Loading yearly breakdown data for ${year}...`);
        
        // Cargar datos usando los nuevos endpoints de breakdown
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