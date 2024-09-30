// sceneManager.js

import { generateEntityId } from './utilities.js';
import { updateDoorList, createDoor } from './doorManager.js';
import { updateTextList, createText } from './textManager.js';
import { showNotification, createListItem } from './uiManager.js';

export let scenes = [];
export let currentScene = null;

import { assetsEl, skyEl } from './uiManager.js';

export const addScenes = (files) => {
    Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            addScene(url);
        } else {
            showNotification(`File ${file.name} is not a valid image.`, 'error');
        }
    });
};

const addScene = (imageSrc) => {
    const sceneId = generateEntityId('scene');

    // Create an <img> element in <a-assets>
    const imgEl = document.createElement('img');
    imgEl.setAttribute('id', `${sceneId}-image`);
    imgEl.setAttribute('src', imageSrc);
    assetsEl.appendChild(imgEl);

    const sceneData = {
        id: sceneId,
        name: `Scene ${scenes.length + 1}`,
        image: `#${imgEl.getAttribute('id')}`,
        doors: [],
        texts: [],
    };

    scenes.push(sceneData);
    updateSceneSelect();

    if (!currentScene) {
        switchScene(sceneId);
    }
};

export const switchScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        currentScene = scene;
        skyEl.setAttribute('material', 'src', scene.image);

        // Remove existing doors and texts
        document.querySelectorAll('.door, .text-element').forEach((el) => {
            el.parentNode.removeChild(el);
        });

        // Add doors and texts for the scene
        scene.doors.forEach((doorData) => createDoor(doorData));
        scene.texts.forEach((textData) => createText(textData));

        // Update UI
        updateDoorList();
        updateTextList();
        updateSceneSelect();
    }
};

export const updateSceneSelect = () => {
    const sceneSelect = document.getElementById('sceneSelect');
    sceneSelect.innerHTML = '';
    scenes.forEach((scene) => {
        const option = document.createElement('option');
        option.value = scene.id;
        option.textContent = scene.name;
        if (currentScene && scene.id === currentScene.id) {
            option.selected = true;
        }
        sceneSelect.appendChild(option);
    });
};

export const openSceneManagementModal = () => {
    const sceneListEl = document.getElementById('sceneList');
    sceneListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    scenes.forEach((scene) => {
        const li = createListItem(scene, 'scene', {
            onRename: () => renameScene(scene.id),
            onDelete: () => deleteScene(scene.id),
        });
        fragment.appendChild(li);
    });
    sceneListEl.appendChild(fragment);
    document.getElementById('sceneManagementModal').style.display = 'flex';
};

const deleteScene = (sceneId) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;

    const sceneIndex = scenes.findIndex((s) => s.id === sceneId);
    if (sceneIndex !== -1) {
        const scene = scenes.splice(sceneIndex, 1)[0];
        const imgEl = document.querySelector(scene.image);
        if (imgEl && imgEl.parentNode) {
            assetsEl.removeChild(imgEl);
        }

        // Remove doors referencing this scene
        scenes.forEach((s) => {
            s.doors = s.doors.filter((doorData) => {
                if (doorData.destinationSceneId === sceneId) {
                    doorData.element.parentNode.removeChild(doorData.element);
                    return false;
                }
                return true;
            });
        });

        if (currentScene && currentScene.id === sceneId) {
            if (scenes.length > 0) {
                switchScene(scenes[0].id);
            } else {
                currentScene = null;
                skyEl.setAttribute('material', 'src', '');
                document.querySelectorAll('.door, .text-element').forEach((el) => {
                    el.parentNode.removeChild(el);
                });
                document.getElementById('doorList').innerHTML = '';
                document.getElementById('textList').innerHTML = '';
            }
        } else {
            updateDoorList();
            updateTextList();
        }
        updateSceneSelect();
    }
};

const renameScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        const newName = prompt('Enter a new name for the scene:', scene.name);
        if (newName && newName.trim() !== '') {
            scene.name = newName.trim();
            updateSceneSelect();
            updateDoorList(); // Update door labels if necessary
        }
    }
};

export const initializeScene = () => {
    showNotification('Welcome! Please add scenes to get started.', 'info');
};
