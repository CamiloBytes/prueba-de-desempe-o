import './api.js'
import './auth.js'
import { router } from './router.js'

// Initialize router when DOM is fully loaded
window.addEventListener('DOMContentLoaded', router);
// Handle route changes when user navigates using hash
window.addEventListener('hashchange', router);