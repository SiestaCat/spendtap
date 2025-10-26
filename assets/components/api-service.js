// === Servicio API ===

class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.token = import.meta.env.VITE_API_TOKEN || '';
  }

  // Headers por defecto
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Obtener gastos por mes y año usando el endpoint correcto
  async getExpenses(month, year) {
    try {
      const url = `${this.baseUrl}/api/spent/filter?month=${month}&year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  // Detectar si es un ingreso basándose en categoría o descripción
  isIncomeTransaction(transaction) {
    const incomeCategories = [
      'salario', 'salary', 'sueldo', 'nómina', 'nomina',
      'freelance', 'consultoría', 'consultoria', 'trabajo',
      'ventas', 'venta', 'ingreso', 'ingresos', 'bonus',
      'comisión', 'comision', 'premio', 'regalo'
    ];
    
    const incomeKeywords = [
      'salario', 'sueldo', 'trabajo', 'freelance', 'venta',
      'ingreso', 'bonus', 'comisión', 'premio', 'extra',
      'paga', 'cobro', 'factura'
    ];
    
    const category = (transaction.category || '').toLowerCase();
    const description = (transaction.description || '').toLowerCase();
    
    // Verificar por categoría
    if (incomeCategories.includes(category)) {
      return true;
    }
    
    // Verificar por palabras clave en descripción
    return incomeKeywords.some(keyword => description.includes(keyword));
  }

  // Obtener todos los datos de un mes (gastos e ingresos detectados automáticamente)
  async getMonthData(month, year) {
    try {
      const expenses = await this.getExpenses(month, year);

      // Normalizar formato de datos y detectar ingresos automáticamente
      const normalizedTransactions = expenses.map(expense => ({
        id: expense.id,
        date: expense.date,
        description: expense.description || 'Sin descripción',
        amount: parseFloat(expense.amount),
        category: expense.category || 'other',
        type: this.isIncomeTransaction(expense) ? 'income' : 'expense'
      }));
      
      // Ordenar por fecha (más recientes primero)
      normalizedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log('Transactions processed:', {
        total: normalizedTransactions.length,
        expenses: normalizedTransactions.filter(t => t.type === 'expense').length,
        incomes: normalizedTransactions.filter(t => t.type === 'income').length
      });

      return normalizedTransactions;
    } catch (error) {
      console.error('Error fetching month data:', error);
      return [];
    }
  }
}

// Instancia global
window.apiService = new ApiService();

export default window.apiService;