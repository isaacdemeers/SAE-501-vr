// main.js

import { setupEventListeners, initializeUI } from './uiManager.js';
import { initializeScene } from './sceneManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initializeUI();

    // Initialize the application
    initializeScene();

    // Setup event listeners
    setupEventListeners();
});
