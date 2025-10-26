// === Vista de desglose mensual ===

class BreakdownView {
  constructor() {
    this.transactions = [];
    this.categoryBreakdown = [];
    this.descriptionBreakdown = [];
    this.monthSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0
    };
  }

  // Inicializar vista
  async init() {
    // Cargar datos
    await this.loadData();
    
    // Renderizar resumen y desgloses
    this.renderMonthSummary();
    this.renderCategoryBreakdown();
    this.renderDescriptionBreakdown();
    
    // Configurar navegación
    this.setupNavigation();
    
    // Actualizar período mostrado
    this.updatePeriod();
  }

  // Cargar datos desde la API
  async loadData() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    
    if (window.apiService) {
      try {
        console.log(`Loading breakdown data for ${month}/${year}...`);
        this.transactions = await window.apiService.getMonthData(month, year);
        
        // Calcular resumen y desgloses
        this.calculateMonthSummary();
        this.calculateBreakdowns();
        
        console.log(`Loaded ${this.transactions.length} transactions for breakdown`);
      } catch (error) {
        console.error('Failed to load breakdown data:', error);
        this.transactions = [];
      }
    }
  }

  // Calcular resumen mensual
  calculateMonthSummary() {
    this.monthSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0
    };

    this.transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        this.monthSummary.totalExpenses += Math.abs(transaction.amount);
      } else if (transaction.type === 'income') {
        this.monthSummary.totalIncome += Math.abs(transaction.amount);
      }
    });

    this.monthSummary.balance = this.monthSummary.totalIncome - this.monthSummary.totalExpenses;
  }

  // Calcular desgloses por categoría y descripción
  calculateBreakdowns() {
    // Desglose por categoría
    const categoryMap = new Map();
    
    this.transactions.forEach(transaction => {
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
    
    this.transactions.forEach(transaction => {
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

  // Renderizar resumen mensual
  renderMonthSummary() {
    const totalIncomeElement = document.getElementById('breakdown-total-income');
    const totalExpensesElement = document.getElementById('breakdown-total-expenses');
    const totalBalanceElement = document.getElementById('breakdown-total-balance');

    if (totalIncomeElement) {
      totalIncomeElement.textContent = this.formatCurrency(this.monthSummary.totalIncome);
    }
    if (totalExpensesElement) {
      totalExpensesElement.textContent = this.formatCurrency(this.monthSummary.totalExpenses);
    }
    if (totalBalanceElement) {
      totalBalanceElement.textContent = this.formatCurrency(this.monthSummary.balance);
      
      // Color dinámico según el balance
      if (this.monthSummary.balance > 0) {
        totalBalanceElement.className = 'text-xl font-bold text-green-600';
      } else if (this.monthSummary.balance < 0) {
        totalBalanceElement.className = 'text-xl font-bold text-red-600';
      } else {
        totalBalanceElement.className = 'text-xl font-bold text-slate-700 dark:text-slate-300';
      }
    }
  }

  // Renderizar desglose por categorías
  renderCategoryBreakdown() {
    const container = document.getElementById('category-breakdown');
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

  // Renderizar desglose por descripciones
  renderDescriptionBreakdown() {
    const container = document.getElementById('description-breakdown');
    if (!container) return;

    if (this.descriptionBreakdown.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-slate-500">
          <p data-i18n="breakdown.noData">No hay datos disponibles</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.descriptionBreakdown.map(item => `
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
  }

  // Actualizar período mostrado
  updatePeriod() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    const periodElement = document.getElementById('breakdown-period');
    
    if (periodElement && window.i18n) {
      const monthName = window.i18n.t(`months.${month}`);
      periodElement.textContent = `${monthName} ${year}`;
    }
  }

  // Configurar navegación
  setupNavigation() {
    // Botón volver al mes
    const backToMonthBtn = document.getElementById('backToMonthBtn');
    if (backToMonthBtn) {
      backToMonthBtn.addEventListener('click', () => {
        if (window.loadPage && window.dateManager) {
          const { month, year } = window.dateManager.getCurrentMonthYear();
          const url = new URL(window.location);
          url.pathname = '/month';
          url.searchParams.set('month', month);
          url.searchParams.set('year', year);
          window.history.pushState({}, '', url.toString());
          window.loadPage('month');
        }
      });
    }

    // Botón desglose anual
    const yearlyBreakdownBtn = document.getElementById('yearlyBreakdownBtn');
    if (yearlyBreakdownBtn) {
      yearlyBreakdownBtn.addEventListener('click', () => {
        if (window.loadPage && window.dateManager) {
          const { month, year } = window.dateManager.getCurrentMonthYear();
          const url = new URL(window.location);
          url.pathname = '/yearly-breakdown';
          url.searchParams.set('month', month);
          url.searchParams.set('year', year);
          window.history.pushState({}, '', url.toString());
          window.loadPage('yearly-breakdown');
        }
      });
    }
  }
}

// Instancia global
window.breakdownView = new BreakdownView();

// Función de inicialización
function initBreakdown() {
  if (window.breakdownView) {
    window.breakdownView.init();
  }
}

window.initBreakdown = initBreakdown;

export default window.breakdownView;