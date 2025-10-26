// === Sistema de internacionalización ===

class I18n {
  constructor() {
    this.currentLanguage = null;
    this.translations = {};
    this.availableLanguages = [];
    this.FALLBACK_LANGUAGES = [import.meta.env.VITE_APP_LANG || 'es'];
  }

  async init() {
    // Detectar idiomas disponibles
    await this.detectAvailableLanguages();
    
    // Determinar idioma a usar
    const userLanguage = this.detectUserLanguage();
    const languageToUse = this.selectLanguage(userLanguage);
    
    // Cargar traducciones
    await this.loadLanguage(languageToUse);
    
    console.log(`I18n initialized with language: ${this.currentLanguage}`);
  }

  async detectAvailableLanguages() {
    try {
      // Detectar automáticamente archivos de idioma disponibles
      const response = await fetch('/assets/lang/');
      const html = await response.text();
      
      // Extraer nombres de archivos .json del HTML del directorio
      const jsonFiles = html.match(/href="[^"]*\.json"/g) || [];
      this.availableLanguages = jsonFiles
        .map(match => match.replace(/href="|\.json"/g, ''))
        .filter(lang => lang && !lang.includes('/'));
      
      // Si no se pueden detectar automáticamente, fallback a buscar idiomas comunes
      if (this.availableLanguages.length === 0) {
        const commonLanguages = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
        for (const lang of commonLanguages) {
          try {
            const testResponse = await fetch(`/assets/lang/${lang}.json`);
            if (testResponse.ok) {
              this.availableLanguages.push(lang);
            }
          } catch {
            // Ignorar errores, continuar con el siguiente idioma
          }
        }
      }
      
    } catch (error) {
      console.warn('Could not detect available languages automatically:', error);
      this.availableLanguages = this.FALLBACK_LANGUAGES;
    }
  }

  detectUserLanguage() {
    // 1. Idioma guardado en localStorage
    const saved = localStorage.getItem('spendtap-language');
    if (saved && this.availableLanguages.includes(saved)) {
      return saved;
    }

    // 2. Idioma del navegador
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    if (this.availableLanguages.includes(langCode)) {
      return langCode;
    }

    return null;
  }

  selectLanguage(userLanguage) {
    // Si hay múltiples idiomas disponibles, usar el detectado
    if (this.availableLanguages.length > 1 && userLanguage) {
      return userLanguage;
    }
    
    // Fallback: usar el primer (único) idioma disponible
    return this.availableLanguages[0];
  }

  async loadLanguage(langCode) {
    try {
      const response = await fetch(`/assets/lang/${langCode}.json`);
      if (!response.ok) {
        throw new Error(`Language file not found: ${langCode}`);
      }
      
      this.translations = await response.json();
      this.currentLanguage = langCode;
      
      // Guardar preferencia
      localStorage.setItem('spendtap-language', langCode);
      
    } catch (error) {
      console.error('Error loading language:', error);
      
      // Fallback al primer idioma disponible si hay error
      if (langCode !== this.availableLanguages[0]) {
        await this.loadLanguage(this.availableLanguages[0]);
      }
    }
  }

  // Función principal de traducción
  t(key, defaultValue = key) {
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return typeof value === 'string' ? value : defaultValue;
  }

  // Cambiar idioma manualmente (para futuro uso)
  async setLanguage(langCode, reload = true) {
    if (this.availableLanguages.includes(langCode)) {
      await this.loadLanguage(langCode);
      
      // Actualizar UI sin recargar por defecto
      if (window.updateTranslations) {
        window.updateTranslations();
      }
      
      // Solo recargar si se solicita explícitamente
      if (reload) {
        window.location.reload();
      }
    }
  }

  // Obtener idiomas disponibles
  getAvailableLanguages() {
    return this.availableLanguages;
  }

  // Obtener idioma actual
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Instancia global
window.i18n = new I18n();

// Función helper global para traducciones
window.t = (key, defaultValue) => window.i18n.t(key, defaultValue);

export default window.i18n;