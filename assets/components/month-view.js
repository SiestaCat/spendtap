// === Vista mensual con datos ficticios ===

class MonthView {
  constructor() {
    this.expenses = [];
  }

  // Generar datos ficticios de gastos
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
        category: randomType.category
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
      services: 'Servicios'
    };
    return names[category] || 'Otros';
  }

  // Renderizar lista de gastos
  renderExpensesList() {
    const container = document.getElementById('expenses-list');
    if (!container) return;

    container.innerHTML = this.expenses.map(expense => `
      <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
        <div class="flex-1 min-w-0 pr-4">
          <div class="flex items-center justify-between mb-1">
            <p class="font-medium text-slate-900 dark:text-slate-100 truncate">${expense.description}</p>
            <p class="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0 ml-2">${this.formatDate(expense.date)}</p>
          </div>
          <div class="flex items-center justify-between">
            <span class="inline-block px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full truncate max-w-32">${this.getCategoryName(expense.category)}</span>
            <p class="font-bold text-lg text-red-600 flex-shrink-0">-${expense.amount.toFixed(2)}€</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Calcular y mostrar resumen
  renderSummary() {
    const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const { month, year } = window.dateManager.getCurrentMonthYear();
    const daysInMonth = new Date(year, month, 0).getDate();
    const averagePerDay = totalExpenses / daysInMonth;

    const totalElement = document.getElementById('total-expenses');
    const averageElement = document.getElementById('average-per-day');

    if (totalElement) {
      totalElement.textContent = `${totalExpenses.toFixed(2)}€`;
    }
    if (averageElement) {
      averageElement.textContent = `${averagePerDay.toFixed(2)}€`;
    }
  }

  // Inicializar vista mensual
  init() {
    this.generateFictionalExpenses();
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
          
          console.log('Current URL params:', { month, year });
          
          const newUrl = new URL(window.location.origin);
          newUrl.pathname = '/';
          
          if (month) newUrl.searchParams.set('month', month);
          if (year) newUrl.searchParams.set('year', year);
          
          console.log('New URL:', newUrl.toString());
          
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