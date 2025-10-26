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
  async getExpenses(month, year, categories = []) {
    try {
      let url = `${this.baseUrl}/api/spent/filter?month=${month}&year=${year}`;
      
      // Añadir filtro por categorías si se especifica
      if (categories && categories.length > 0) {
        const categoriesParam = encodeURIComponent(JSON.stringify(categories));
        url += `&categories=${categoriesParam}`;
      }
      
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
    
    // Debug para ver qué está clasificando
    const isIncome = incomeCategories.includes(category) || 
                    incomeKeywords.some(keyword => description.includes(keyword));
    
    console.log(`Transaction ${transaction.id}: "${transaction.description}" | Category: "${transaction.category}" | Amount: ${transaction.amount} | Classified as: ${isIncome ? 'INCOME' : 'EXPENSE'}`);
    
    return isIncome;
  }

  // Obtener todos los datos de un mes (gastos e ingresos detectados automáticamente)
  async getMonthData(month, year, categories = []) {
    try {
      const expenses = await this.getExpenses(month, year, categories);

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
        incomes: normalizedTransactions.filter(t => t.type === 'income').length,
        filteredCategories: categories
      });

      return normalizedTransactions;
    } catch (error) {
      console.error('Error fetching month data:', error);
      return [];
    }
  }

  // Eliminar una transacción
  async deleteTransaction(id) {
    try {
      const url = `${this.baseUrl}/api/spent/delete/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Delete response:', data);
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // Editar una transacción
  async editTransaction(id, data) {
    try {
      const url = `${this.baseUrl}/api/spent/edit/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Edit response:', result);
      return result;
    } catch (error) {
      console.error('Error editing transaction:', error);
      return null;
    }
  }

  // Obtener todas las descripciones
  async getAllDescriptions() {
    try {
      const url = `${this.baseUrl}/api/spent/all_descriptions`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.descriptions || [];
    } catch (error) {
      console.error('Error fetching descriptions:', error);
      return [];
    }
  }

  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const url = `${this.baseUrl}/api/spent/all_categories`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Obtener últimas categorías
  async getLastCategories(limit = 5) {
    try {
      const url = `${this.baseUrl}/api/spent/last_categories?limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching last categories:', error);
      return [];
    }
  }

  // Obtener últimas descripciones
  async getLastDescriptions(limit = 5) {
    try {
      const url = `${this.baseUrl}/api/spent/last_descriptions?limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.descriptions || [];
    } catch (error) {
      console.error('Error fetching last descriptions:', error);
      return [];
    }
  }

  // Crear nueva transacción
  async createTransaction(data) {
    try {
      const url = `${this.baseUrl}/api/spent/create`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Create transaction response:', result);
      return result;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }

  // Copiar transacciones de un mes anterior
  async copyMonth(sourceMonth, sourceYear, targetMonth, targetYear, category = null) {
    try {
      const url = `${this.baseUrl}/api/spent/copy_month`;
      
      const body = {
        source_month: sourceMonth,
        source_year: sourceYear,
        target_month: targetMonth,
        target_year: targetYear
      };
      
      // Añadir categoría solo si se especifica
      if (category && category.trim()) {
        body.category = category.trim();
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error copying month:', error);
      return null;
    }
  }

  // === BREAKDOWN ENDPOINTS ===

  // Obtener resumen mensual
  async getMonthBreakdown(month, year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_month?month=${month}&year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching month breakdown:', error);
      return null;
    }
  }

  // Obtener resumen anual
  async getYearBreakdown(year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_year?year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching year breakdown:', error);
      return null;
    }
  }

  // Obtener desglose por categorías mensuales
  async getCategoryBreakdownMonth(month, year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_category_month?month=${month}&year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category breakdown month:', error);
      return null;
    }
  }

  // Obtener desglose por categorías anuales
  async getCategoryBreakdownYear(year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_category_year?year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category breakdown year:', error);
      return null;
    }
  }

  // Obtener desglose por descripción mensual
  async getDescriptionBreakdownMonth(month, year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_description_month?month=${month}&year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching description breakdown month:', error);
      return null;
    }
  }

  // Obtener desglose por descripción anual
  async getDescriptionBreakdownYear(year) {
    try {
      const url = `${this.baseUrl}/api/spent/breakdown_description_year?year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching description breakdown year:', error);
      return null;
    }
  }

  // Obtener balance al final del período
  async getBalance(month, year) {
    try {
      const url = `${this.baseUrl}/api/spent/balance?month=${month}&year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return null;
    }
  }
}

// Instancia global
window.apiService = new ApiService();

export default window.apiService;