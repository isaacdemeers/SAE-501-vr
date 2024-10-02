import { cartesianToSpherical, sphericalToCartesian } from './utilities.js';
import { saveProjectToLocalStorage } from './storageManager.js';

let isDragging = false;
let draggedTag = null;
let tagSphericalCoords = null;
let lastMousePosition = new THREE.Vector2();

export const initDraggable = (tagElement, tagData, sceneEl) => {
    tagElement.addEventListener('mousedown', (event) => {
        startDragging(event, tagData, sceneEl);
    });

    sceneEl.addEventListener('mousemove', (event) => {
        if (isDragging) {
            dragTag(event, tagData, sceneEl);
        }
    });

    sceneEl.addEventListener('mouseup', () => {
        stopDragging(tagData);
    });
};

const startDragging = (event, tagData, sceneEl) => {
    isDragging = true;
    draggedTag = tagData;
    tagSphericalCoords = cartesianToSpherical(tagData.position);
    lastMousePosition.set(event.clientX, event.clientY);
    event.preventDefault();
    event.stopPropagation();
};

const dragTag = (event, tagData, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    const camera = sceneEl.camera;
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize();

    const radius = tagSphericalCoords.radius;
    const distance = radius / vector.dot(new THREE.Vector3(0, 0, -1));
    const newPosition = camera.position.clone().add(vector.multiplyScalar(distance));

    // Convert to spherical coordinates
    const newSpherical = cartesianToSpherical(newPosition);

    // Maintain the original radius
    newSpherical.radius = radius;

    // Allow full 360-degree rotation
    tagSphericalCoords.theta = newSpherical.theta;
    tagSphericalCoords.phi = Math.max(0.01, Math.min(Math.PI - 0.01, newSpherical.phi));

    // Convert back to Cartesian coordinates
    const finalPosition = sphericalToCartesian(tagSphericalCoords);

    // Update tag position
    tagData.position.copy(finalPosition);
    tagData.element.setAttribute('position', finalPosition);

    lastMousePosition.set(event.clientX, event.clientY);
};

const stopDragging = (tagData) => {
    if (isDragging) {
        isDragging = false;
        draggedTag = null;
        tagSphericalCoords = null;

        // Save the new position
        saveProjectToLocalStorage();
    }
};