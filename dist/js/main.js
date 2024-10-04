import { setupEventListeners, initializeUI } from './uiManager.js';
import { initializeScene } from './sceneManager.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    initializeScene();
    setupEventListeners();
});
