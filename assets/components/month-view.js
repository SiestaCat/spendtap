// === Vista mensual con datos ficticios ===

class MonthView {
  constructor() {
    this.expenses = [];
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
        console.error('Failed to load from API, falling back to fictional data:', error);
      }
    }
    
    // Fallback a datos ficticios si no hay API
    this.generateFictionalExpenses();
  }

  // Generar datos ficticios de gastos e ingresos (fallback)
  generateFictionalExpenses() {
    const { month, year } = window.dateManager.getCurrentMonthYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const expenseTypes = [
      { category: 'food', items: ['Supermercado', 'Restaurante', 'Café', 'Panadería', 'Comida rápida'] },
      { category: 'transport', items: ['Metro', 'Autobús', 'Taxi', 'Gasolina', 'Parking'] },
      { category: 'entertainment', items: ['Cinema', 'Concierto', 'Libro', 'Videojuego', 'Teatro'] },
      { category: 'shopping', items: ['Ropa', 'Zapatos', 'Electrónicos', 'Casa', 'Farmacia'] },
      { category: 'services', items: ['Internet', 'Móvil', 'Luz', 'Agua', 'Gas'] }
    ];

    const incomeTypes = [
      { category: 'salary', items: ['Salario', 'Bonus', 'Horas extra'] },
      { category: 'freelance', items: ['Proyecto freelance', 'Consultoría', 'Trabajo remoto'] },
      { category: 'other', items: ['Venta segunda mano', 'Reembolso', 'Regalo en efectivo'] }
    ];

    this.expenses = [];

    // Generar 15-25 gastos aleatorios en el mes
    const numExpenses = Math.floor(Math.random() * 11) + 15; // 15-25
    
    for (let i = 0; i < numExpenses; i++) {
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const randomType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
      const randomItem = randomType.items[Math.floor(Math.random() * randomType.items.length)];
      
      // Generar cantidades realistas según el tipo
      let amount;
      switch (randomType.category) {
        case 'food':
          amount = (Math.random() * 45 + 5).toFixed(2); // 5-50€
          break;
        case 'transport':
          amount = (Math.random() * 25 + 2).toFixed(2); // 2-27€
          break;
        case 'entertainment':
          amount = (Math.random() * 35 + 8).toFixed(2); // 8-43€
          break;
        case 'shopping':
          amount = (Math.random() * 80 + 10).toFixed(2); // 10-90€
          break;
        case 'services':
          amount = (Math.random() * 60 + 20).toFixed(2); // 20-80€
          break;
        default:
          amount = (Math.random() * 30 + 5).toFixed(2);
      }

      this.expenses.push({
        date: `${year}-${month.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`,
        description: randomItem,
        amount: parseFloat(amount),
        category: randomType.category,
        type: 'expense'
      });
    }

    // Generar 2-5 ingresos aleatorios en el mes
    const numIncomes = Math.floor(Math.random() * 4) + 2; // 2-5
    
    for (let i = 0; i < numIncomes; i++) {
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const randomType = incomeTypes[Math.floor(Math.random() * incomeTypes.length)];
      const randomItem = randomType.items[Math.floor(Math.random() * randomType.items.length)];
      
      // Generar cantidades realistas de ingresos
      let amount;
      switch (randomType.category) {
        case 'salary':
          amount = (Math.random() * 1500 + 1000).toFixed(2); // 1000-2500€
          break;
        case 'freelance':
          amount = (Math.random() * 800 + 200).toFixed(2); // 200-1000€
          break;
        case 'other':
          amount = (Math.random() * 150 + 50).toFixed(2); // 50-200€
          break;
        default:
          amount = (Math.random() * 300 + 100).toFixed(2);
      }

      this.expenses.push({
        date: `${year}-${month.toString().padStart(2, '0')}-${randomDay.toString().padStart(2, '0')}`,
        description: randomItem,
        amount: parseFloat(amount),
        category: randomType.category,
        type: 'income'
      });
    }

    // Ordenar por fecha descendente (más recientes primero)
    this.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Formatear fecha para mostrar
  formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }

  // Obtener nombre de categoría traducido
  getCategoryName(category) {
    const names = {
      food: 'Comida',
      transport: 'Transporte',
      entertainment: 'Entretenimiento',
      shopping: 'Compras',
      services: 'Servicios',
      salary: 'Salario',
      freelance: 'Freelance',
      other: 'Otros'
    };
    return names[category] || 'Otros';
  }

  // Renderizar lista de gastos e ingresos
  renderExpensesList() {
    const container = document.getElementById('expenses-list');
    if (!container) return;

    container.innerHTML = this.expenses.map(item => `
      <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <div class="flex-1 min-w-0 pr-4">
          <div class="flex items-center justify-between mb-1">
            <p class="font-medium text-slate-900 dark:text-slate-100 truncate">${item.description}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">${this.formatDate(item.date)}</p>
          </div>
          <div class="flex items-center justify-between">
            <span class="inline-block px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full truncate max-w-32">${this.getCategoryName(item.category)}</span>
            <p class="font-bold text-lg ${item.type === 'income' ? 'text-green-600' : 'text-red-600'} flex-shrink-0">
              ${item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}€
            </p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Calcular y mostrar resumen
  renderSummary() {
    const expenses = this.expenses.filter(item => item.type === 'expense');
    const incomes = this.expenses.filter(item => item.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const balance = totalIncome - totalExpenses;

    const totalExpensesElement = document.getElementById('total-expenses');
    const totalIncomeElement = document.getElementById('total-income');
    const totalBalanceElement = document.getElementById('total-balance');

    if (totalExpensesElement) {
      totalExpensesElement.textContent = `${totalExpenses.toFixed(2)}€`;
    }
    if (totalIncomeElement) {
      totalIncomeElement.textContent = `${totalIncome.toFixed(2)}€`;
    }
    if (totalBalanceElement) {
      totalBalanceElement.textContent = `${balance.toFixed(2)}€`;
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

    // Cargar datos (API o ficticios)
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