// doorManager.js

import { sceneEl, showNotification, createListItem, cameraEl } from './uiManager.js';
import { scenes, currentScene, switchScene } from './sceneManager.js';
import { generateEntityId, vector3ToObject } from './utilities.js';

let placingDoor = false;
let doorPosition = null;

export const startPlacingDoor = () => {
    if (!currentScene) {
        showNotification('Please add a scene first.', 'error');
        return;
    }
    if (scenes.length < 2) {
        showNotification('Please add at least 2 scenes to add a door.', 'error');
        return;
    }
    placingDoor = true;
    showNotification('Click on the scene to place a door.', 'info');
    document.getElementById('placeDoorButton').disabled = true;
};

export const handleSkyClickForDoor = (event) => {
    if (placingDoor) {
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
                doorPosition = cameraPosition.add(directionVector.multiplyScalar(maxDistance));
            } else {
                doorPosition = intersectionPoint;
            }

            openDoorPlacementModal();
        }
    }
};

export const cancelPlacingDoor = () => {
    placingDoor = false;
    doorPosition = null;
    showNotification('', 'info');
    document.getElementById('placeDoorButton').disabled = false;
};

const openDoorPlacementModal = () => {
    const destinationSceneListEl = document.getElementById('destinationSceneList');
    destinationSceneListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    scenes
        .filter((scene) => scene.id !== currentScene.id)
        .forEach((scene) => {
            const li = document.createElement('li');
            li.textContent = scene.name;
            li.dataset.sceneId = scene.id;
            li.classList.add('scene-link');
            li.addEventListener('click', () => selectDestinationScene(scene.id));
            fragment.appendChild(li);
        });
    destinationSceneListEl.appendChild(fragment);
    document.getElementById('doorPlacementModal').style.display = 'block';
    showNotification('', 'info');
};

const selectDestinationScene = (destinationSceneId) => {
    const doorId = generateEntityId('door');
    const doorData = {
        id: doorId,
        name: `Door ${currentScene.doors.length + 1}`,
        position: doorPosition.clone(),
        destinationSceneId: destinationSceneId,
    };

    currentScene.doors.push(doorData);
    createDoor(doorData);
    updateDoorList();

    placingDoor = false;
    doorPosition = null;
    document.getElementById('doorPlacementModal').style.display = 'none';
    document.getElementById('placeDoorButton').disabled = false;
};

export const createDoor = (doorData) => {
    const doorEl = document.createElement('a-box');
    doorEl.setAttribute('color', '#4CC3D9');
    doorEl.setAttribute('height', 2);
    doorEl.setAttribute('width', 1);
    doorEl.setAttribute('depth', 0.1);
    doorEl.setAttribute('position', vector3ToObject(doorData.position));
    doorEl.setAttribute('class', 'door clickable');
    doorEl.setAttribute('door-destination', doorData.destinationSceneId);
    doorEl.setAttribute('door-id', doorData.id);
    doorEl.setAttribute('tabindex', '0');
    doorEl.setAttribute('look-at', '#camera');

    // Add a text label to the door
    const destinationScene = scenes.find((s) => s.id === doorData.destinationSceneId);
    const labelEl = document.createElement('a-text');
    labelEl.setAttribute('value', destinationScene.name);
    labelEl.setAttribute('align', 'center');
    labelEl.setAttribute('color', '#FFFFFF');
    labelEl.setAttribute('width', 4);
    labelEl.setAttribute('position', { x: 0, y: 1.5, z: 0 }); // Position above the door
    labelEl.setAttribute('look-at', '#camera');
    doorEl.appendChild(labelEl);
    doorData.labelElement = labelEl;

    doorEl.addEventListener('click', onDoorClick);
    sceneEl.appendChild(doorEl);
    doorData.element = doorEl;
};

const onDoorClick = function () {
    const destinationSceneId = this.getAttribute('door-destination');
    switchScene(destinationSceneId);
};

export const updateDoorList = () => {
    const doorListEl = document.getElementById('doorList');
    doorListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    currentScene.doors.forEach((doorData) => {
        const destinationScene = scenes.find(
            (s) => s.id === doorData.destinationSceneId
        );
        const destinationName = destinationScene ? destinationScene.name : 'Unknown';
        const li = createListItem(
            {
                id: doorData.id,
                name: doorData.name,
                destinationSceneId: doorData.destinationSceneId,
            },
            'door',
            {
                destinationOptions: scenes.filter((s) => s.id !== currentScene.id),
                onDestinationChange: (newDestinationSceneId) => {
                    updateDoorDestination(doorData, newDestinationSceneId);
                },
                onRename: () => renameDoor(doorData.id),
                onDelete: () => deleteDoor(doorData.id),
            }
        );
        fragment.appendChild(li);
    });
    doorListEl.appendChild(fragment);
};

const deleteDoor = (doorId) => {
    const doorIndex = currentScene.doors.findIndex((d) => d.id === doorId);
    if (doorIndex !== -1) {
        const doorData = currentScene.doors[doorIndex];
        doorData.element.removeEventListener('click', onDoorClick);
        doorData.element.parentNode.removeChild(doorData.element);
        currentScene.doors.splice(doorIndex, 1);
        updateDoorList();
    }
};

const updateDoorDestination = (doorData, newDestinationSceneId) => {
    doorData.destinationSceneId = newDestinationSceneId;
    doorData.element.setAttribute('door-destination', newDestinationSceneId);

    // Update the label text
    const destinationScene = scenes.find((s) => s.id === newDestinationSceneId);
    if (doorData.labelElement) {
        doorData.labelElement.setAttribute('value', destinationScene.name);
    }

    updateDoorList();
};

const renameDoor = (doorId) => {
    const doorData = currentScene.doors.find((d) => d.id === doorId);
    if (doorData) {
        const newName = prompt('Enter a new name for the door:', doorData.name);
        if (newName && newName.trim() !== '') {
            doorData.name = newName.trim();
            updateDoorList();
        }
    }
};
