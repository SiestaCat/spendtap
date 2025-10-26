// Simple template system for SpendTap
class TemplateSystem {
  constructor() {
    this.cache = new Map();
  }

  async loadTemplate(path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${path}`);
      }
      const template = await response.text();
      this.cache.set(path, template);
      return template;
    } catch (error) {
      console.error('Template loading error:', error);
      return '';
    }
  }

  async loadComponent(componentName) {
    return await this.loadTemplate(`/components/${componentName}.html`);
  }

  async renderPage(pageData) {
    const baseTemplate = await this.loadTemplate('/templates/base.html');
    const headerComponent = await this.loadComponent('header');
    
    // Handle title - if no title specified, just use "SpendTap"
    const title = pageData.title ? `${pageData.title} - SpendTap` : 'SpendTap';
    
    // Replace placeholders in base template
    let rendered = baseTemplate
      .replace('{{title}}', title)
      .replace('{{content}}', pageData.content || '')
      .replace('{{mainClass}}', pageData.mainClass || '');

    // Render the page
    document.documentElement.innerHTML = rendered;

    // Load header component
    const headerElement = document.getElementById('header-component');
    if (headerElement) {
      headerElement.innerHTML = headerComponent;
    }

    // Dynamically load main.js script
    await this.loadScript('/assets/main.js');

    // Wait a bit for script to execute and then initialize
    setTimeout(() => {
      console.log('Trying to init theme, function available:', !!window.initTheme);
      if (window.initTheme) {
        window.initTheme();
      }

      // Re-run any initialization scripts
      if (pageData.onRender) {
        console.log('Running onRender for page');
        pageData.onRender();
      }
    }, 100);
  }

  async loadScript(src) {
    return new Promise((resolve, reject) => {
      // Remove existing script if any
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Simple client-side routing
  async route(path, pageData) {
    // Create serializable state (remove functions)
    const serializableState = {
      path,
      title: pageData.title,
      content: pageData.content,
      mainClass: pageData.mainClass
    };

    // Update URL without page reload
    if (path !== window.location.pathname) {
      history.pushState(serializableState, '', path);
    }

    await this.renderPage(pageData);
  }
}

// Global template system instance
window.templateSystem = new TemplateSystem();

// Handle browser back/forward buttons
window.addEventListener('popstate', async (event) => {
  if (event.state) {
    // Reconstruct pageData from serializable state
    const pageData = {
      title: event.state.title,
      content: event.state.content,
      mainClass: event.state.mainClass,
      onRender: null // Will be handled by page-specific logic
    };
    await window.templateSystem.renderPage(pageData);
  }
});

export default window.templateSystem;