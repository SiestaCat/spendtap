// Page configurations
import templateSystem from '/assets/template-system.js';

export const pages = {
  home: {
    title: null, // No title for home page, will show just "SpendTap"
    mainClass: 'items-center justify-center',
    async load() {
      const content = await templateSystem.loadTemplate('/pages/home.html');
      return {
        title: this.title,
        content,
        mainClass: this.mainClass,
        onRender: () => {
          // Re-initialize home page functionality
          if (window.initHomePage) {
            window.initHomePage();
          }
        }
      };
    }
  },

  // Example: monthly view page (placeholder)
  month: {
    title: 'Vista Mensual',
    mainClass: 'items-start justify-start',
    async load() {
      return {
        title: this.title,
        content: `
          <div class="w-full">
            <h2 class="text-xl font-semibold mb-4">Vista Mensual</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-4">Aquí irían los gastos del mes.</p>
            <button onclick="navigateToHome()" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
              Volver al inicio
            </button>
          </div>
        `,
        mainClass: this.mainClass,
        onRender: () => {
          // Setup monthly view functionality
          window.navigateToHome = () => {
            loadPage('home');
          };
        }
      };
    }
  }
};

// Navigation helper
export async function loadPage(pageName) {
  const page = pages[pageName];
  if (page) {
    const pageData = await page.load();
    await templateSystem.route(`/${pageName}`, pageData);
  }
}

// Initialize routing
export function initRouter() {
  // Handle initial page load
  const path = window.location.pathname;
  const pageName = path === '/' ? 'home' : path.slice(1);
  loadPage(pageName);

  // Make loadPage globally available
  window.loadPage = loadPage;
}