// uiManager.js

import { addScenes, switchScene, updateSceneSelect, openSceneManagementModal } from './sceneManager.js';
import {
    startPlacingDoor,
    handleSkyClickForDoor,
    cancelPlacingDoor,
} from './doorManager.js';
import {
    startPlacingText,
    handleSkyClickForText,
    confirmTextPlacement,
    cancelPlacingText,
} from './textManager.js';

export let assetsEl;
export let skyEl;
export let sceneEl;
export let cameraEl;

export const initializeUI = () => {
    assetsEl = document.querySelector('#assets');
    skyEl = document.querySelector('#sky');
    sceneEl = document.querySelector('a-scene');
    cameraEl = document.querySelector('#camera');
};

export const showNotification = (message, type = 'info') => {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.style.display = message ? 'block' : 'none';
    notificationEl.style.backgroundColor =
        type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007BFF';

    // Auto-hide after 3 seconds
    if (message) {
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    }
};

export const setupEventListeners = () => {
    // Handle scene image upload
    const fileInput = document.getElementById('sceneImageUpload');
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        if (files.length > 0) {
            addScenes(files);
            fileInput.value = '';
        }
    });

    document.getElementById('placeDoorButton').addEventListener('click', () => {
        startPlacingDoor();
    });

    document.getElementById('addTextButton').addEventListener('click', () => {
        startPlacingText();
    });

    skyEl.addEventListener('click', (event) => {
        handleSkyClickForDoor(event);
        handleSkyClickForText(event);
    });

    document
        .getElementById('cancelDoorPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingDoor();
            document.getElementById('doorPlacementModal').style.display = 'none';
        });

    // Text placement modal event listeners
    document
        .getElementById('confirmTextPlacementButton')
        .addEventListener('click', () => {
            confirmTextPlacement();
        });

    document
        .getElementById('cancelTextPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingText();
            document.getElementById('textPlacementModal').style.display = 'none';
        });

    // Scene select event listener
    const sceneSelect = document.getElementById('sceneSelect');
    sceneSelect.addEventListener('change', () => {
        const selectedSceneId = sceneSelect.value;
        switchScene(selectedSceneId);
    });

    // Manage Scenes button
    document
        .getElementById('manageScenesButton')
        .addEventListener('click', () => {
            openSceneManagementModal();
        });

    // Close Scene Management Modal
    document
        .getElementById('closeSceneManagementButton')
        .addEventListener('click', () => {
            document.getElementById('sceneManagementModal').style.display = 'none';
        });
};

// Helper function
export const createListItem = (data, type, actions) => {
    const li = document.createElement('li');
    li.dataset[`${type}Id`] = data.id;

    if (type === 'door') {
        const nameSpan = document.createElement('span');
        nameSpan.textContent = data.name;
        nameSpan.classList.add('door-name');
        li.appendChild(nameSpan);

        // Destination scene select
        const select = document.createElement('select');
        select.classList.add('door-destination-select');
        select.addEventListener('change', (event) => {
            actions.onDestinationChange(event.target.value);
        });

        // Populate options
        actions.destinationOptions.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option.id;
            opt.textContent = option.name;
            if (option.id === data.destinationSceneId) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });

        li.appendChild(select);

        // Rename button
        const renameBtn = document.createElement('button');
        renameBtn.textContent = 'Rename';
        renameBtn.classList.add('rename-button');
        renameBtn.addEventListener('click', actions.onRename);
        li.appendChild(renameBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-button');
        deleteBtn.addEventListener('click', actions.onDelete);
        li.appendChild(deleteBtn);
    } else if (type === 'text') {
        const textarea = document.createElement('textarea');
        textarea.value = data.content;
        textarea.classList.add('text-input');
        textarea.addEventListener('input', (event) => {
            actions.onContentChange(event.target.value);
        });
        li.appendChild(textarea);

        const renameBtn = document.createElement('button');
        renameBtn.textContent = 'Rename';
        renameBtn.classList.add('rename-button');
        renameBtn.addEventListener('click', actions.onRename);
        li.appendChild(renameBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-button');
        deleteBtn.addEventListener('click', actions.onDelete);
        li.appendChild(deleteBtn);
    } else if (type === 'scene') {
        const nameSpan = document.createElement('span');
        nameSpan.textContent = data.name;
        nameSpan.classList.add('scene-name');
        li.appendChild(nameSpan);

        const renameBtn = document.createElement('button');
        renameBtn.textContent = 'Rename';
        renameBtn.classList.add('rename-button');
        renameBtn.addEventListener('click', actions.onRename);
        li.appendChild(renameBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-button');
        deleteBtn.addEventListener('click', actions.onDelete);
        li.appendChild(deleteBtn);
    }

    return li;
};
