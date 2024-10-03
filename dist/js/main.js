import { setupEventListeners, initializeUI } from './uiManager.js';
import { initializeScene } from './sceneManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', () => {
        initializeUI();
        initializeScene();
        setupEventListeners();
    });
});
