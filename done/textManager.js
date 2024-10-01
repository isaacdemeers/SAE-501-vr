// textManager.js

import { sceneEl, showNotification, createListItem, cameraEl } from './uiManager.js';
import { currentScene } from './sceneManager.js';
import { generateEntityId, vector3ToObject } from './utilities.js';

let placingText = false;
let textPosition = null;

export const startPlacingText = () => {
    if (!currentScene) {
        showNotification('Please add a scene first.', 'error');
        return;
    }
    placingText = true;
    showNotification('Click on the scene to place the text.', 'info');
    document.getElementById('addTextButton').disabled = true;
};

export const handleSkyClickForText = (event) => {
    if (placingText) {
        const intersection = event.detail.intersection;
        if (intersection) {
            const cameraPosition = cameraEl.object3D.position.clone();
            const intersectionPoint = intersection.point.clone();

            // Calculate the distance from the camera to the intersection point
            const distance = cameraPosition.distanceTo(intersectionPoint);
            const maxDistance = 10; // Maximum distance from the camera

            if (distance > maxDistance) {
                // Adjust position to be at maxDistance along the click direction
                const directionVector = intersectionPoint.sub(cameraPosition).normalize();
                textPosition = cameraPosition.add(directionVector.multiplyScalar(maxDistance));
            } else {
                textPosition = intersectionPoint;
            }

            openTextPlacementModal();
        }
    }
};

export const cancelPlacingText = () => {
    placingText = false;
    textPosition = null;
    showNotification('', 'info');
    document.getElementById('addTextButton').disabled = false;
};

const openTextPlacementModal = () => {
    document.getElementById('textContentInput').value = '';
    document.getElementById('textPlacementModal').style.display = 'flex';
};

export const confirmTextPlacement = () => {
    const textContent = document
        .getElementById('textContentInput')
        .value.trim();
    if (textContent === '') {
        showNotification('Text content cannot be empty.', 'error');
        return;
    }
    addText(textContent);
    document.getElementById('textPlacementModal').style.display = 'none';
    placingText = false;
    textPosition = null;
    document.getElementById('addTextButton').disabled = false;
};

const addText = (textContent) => {
    const textId = generateEntityId('text');
    const textData = {
        id: textId,
        name: `Text ${currentScene.texts.length + 1}`,
        content: textContent,
        position: textPosition.clone(),
    };
    currentScene.texts.push(textData);
    createText(textData);
    updateTextList();
};

export const createText = (textData) => {
    const textEl = document.createElement('a-text');
    textEl.setAttribute('value', textData.content);
    textEl.setAttribute('color', '#FFFFFF');
    textEl.setAttribute('align', 'center');
    textEl.setAttribute('width', 4);
    textEl.setAttribute('position', vector3ToObject(textData.position));
    textEl.setAttribute('class', 'text-element');
    textEl.setAttribute('text-id', textData.id);
    textEl.setAttribute('tabindex', '0');
    textEl.setAttribute('look-at', '#camera');

    sceneEl.appendChild(textEl);
    textData.element = textEl;
};

export const updateTextList = () => {
    const textListEl = document.getElementById('textList');
    textListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    currentScene.texts.forEach((textData) => {
        const li = createListItem(textData, 'text', {
            onContentChange: (newContent) => {
                updateTextContent(textData, newContent);
            },
            onRename: () => renameText(textData.id),
            onDelete: () => deleteText(textData.id),
        });
        fragment.appendChild(li);
    });
    textListEl.appendChild(fragment);
};

const deleteText = (textId) => {
    const textIndex = currentScene.texts.findIndex((t) => t.id === textId);
    if (textIndex !== -1) {
        const textData = currentScene.texts[textIndex];
        textData.element.parentNode.removeChild(textData.element);
        currentScene.texts.splice(textIndex, 1);
        updateTextList();
    }
};

const updateTextContent = (textData, newContent) => {
    textData.content = newContent;
    textData.element.setAttribute('value', newContent);
};

const renameText = (textId) => {
    const textData = currentScene.texts.find((t) => t.id === textId);
    if (textData) {
        const newName = prompt('Enter a new name for the text:', textData.name);
        if (newName && newName.trim() !== '') {
            textData.name = newName.trim();
            updateTextList();
        }
    }
};
