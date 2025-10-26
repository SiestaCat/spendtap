// === Actualizador de traducciones en DOM ===

function updateTranslations() {
  if (!window.i18n) return;

  // Actualizar elementos con data-i18n
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = window.t(key);
    
    if (translation !== key) {
      element.textContent = translation;
    }
  });

  // Actualizar aria-labels con data-i18n-aria
  const ariaElements = document.querySelectorAll('[data-i18n-aria]');
  ariaElements.forEach(element => {
    const key = element.getAttribute('data-i18n-aria');
    const translation = window.t(key);
    
    if (translation !== key) {
      element.setAttribute('aria-label', translation);
    }
  });

  // Actualizar el toast message
  const toastMessage = document.querySelector('#toast span');
  if (toastMessage) {
    toastMessage.textContent = window.t('messages.saved');
  }

  // Actualizar step values
  if (window.STEP_VALUES) {
    window.STEP_VALUES.forEach((step, index) => {
      switch (step.value) {
        case 0.10:
          step.label = window.t('steps.cents');
          break;
        case 1.00:
          step.label = window.t('steps.euro');
          break;
        case 10.00:
          step.label = window.t('steps.tenEuros');
          break;
        case 100.00:
          step.label = window.t('steps.hundredEuros');
          break;
      }
    });

    // Update current step label
    const stepLabel = document.getElementById('stepLabel');
    if (stepLabel && window.stepState) {
      const currentStep = window.STEP_VALUES[window.stepState.currentStepIndex];
      if (currentStep) {
        stepLabel.textContent = currentStep.label;
      }
    }
  }
}

// Export function
window.updateTranslations = updateTranslations;