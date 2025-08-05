import './api.js'
import './auth.js'
import { router } from './router.js'

console.log('🚀 Aplicación iniciando...');

// Initialize router when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM cargado, inicializando router');
    router();
});

// Handle route changes when user navigates using hash
window.addEventListener('hashchange', () => {
    console.log('🔄 Hash cambiado:', location.hash);
    router();
});

// Handle page load
window.addEventListener('load', () => {
    console.log('📄 Página completamente cargada');
    if (!location.hash) {
        location.hash = '#/';
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('❌ Error global:', event.error);
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rechazada no manejada:', event.reason);
});

console.log('✅ Event listeners configurados');