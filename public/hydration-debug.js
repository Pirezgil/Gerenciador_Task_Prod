// Debug de Hidratação
// Adicione este script ao layout se precisar debugar mais problemas

window.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 DOM Carregado - Pronto para aplicar tema');
  
  // Detectar mismatches de hidratação
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.target === document.documentElement) {
        console.log('📝 Mudança no HTML root:', mutation.attributeName);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style']
  });
});
