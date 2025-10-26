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

  // Monthly view page
  month: {
    title: null, // Dynamic title based on month/year
    mainClass: 'items-start justify-start pt-8',
    async load() {
      const content = await templateSystem.loadTemplate('/pages/month.html');
      
      // Get dynamic title
      const { month, year } = window.dateManager ? window.dateManager.getCurrentMonthYear() : { month: 10, year: 2025 };
      const monthName = window.dateManager ? window.dateManager.getMonthName(month) : 'Octubre';
      const dynamicTitle = `${monthName} ${year}`;
      
      return {
        title: dynamicTitle,
        content,
        mainClass: this.mainClass,
        onRender: () => {
          // Initialize month page functionality
          if (window.initMonthPage) {
            window.initMonthPage();
          }
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
    const currentParams = window.location.search;
    const path = pageName === 'home' ? `/${currentParams}`.replace('/?', '/?') : `/${pageName}${currentParams}`;
    await templateSystem.route(path, pageData);
  }
}

// Initialize routing
export function initRouter() {
  // Handle initial page load
  const path = window.location.pathname;
  const pageName = path === '/' || path === '/home' ? 'home' : path.slice(1);
  loadPage(pageName);

  // Listen for browser back/forward buttons
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;
    const currentPageName = currentPath === '/' || currentPath === '/home' ? 'home' : currentPath.slice(1);
    loadPage(currentPageName);
  });

  // Make loadPage globally available
  window.loadPage = loadPage;
}