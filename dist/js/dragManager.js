import { cartesianToSpherical, sphericalToCartesian } from './utilities.js';
import { saveProjectToLocalStorage } from './storageManager.js';

let isDragging = false;
let draggedTag = null;
let initialTheta = 0;
let totalRotation = 0;

export const initDraggable = (tagElement, tagData, sceneEl) => {
    tagElement.addEventListener('mousedown', (event) => {
        startDragging(event, tagData, sceneEl);
    });

    sceneEl.addEventListener('mousemove', (event) => {
        if (isDragging) {
            dragTag(event, sceneEl);
        }
    });

    sceneEl.addEventListener('mouseup', () => {
        stopDragging();
    });
};

const startDragging = (event, tagData, sceneEl) => {
    isDragging = true;
    draggedTag = tagData;
    const sphericalCoords = cartesianToSpherical(tagData.position);
    initialTheta = sphericalCoords.theta;
    totalRotation = 0;
    event.preventDefault();
    event.stopPropagation();
};

const dragTag = (event, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    const camera = sceneEl.camera;
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    vector.sub(camera.position).normalize();

    const sphericalCoords = cartesianToSpherical(draggedTag.position);
    const radius = sphericalCoords.radius;

    // Calculate rotation based on mouse movement
    const deltaX = event.movementX || 0;
    const deltaY = event.movementY || 0;

    // Adjust these values to change the dragging sensitivity
    const sensitivityX = 0.01;
    const sensitivityY = 0.01;

    totalRotation -= deltaX * sensitivityX;
    sphericalCoords.theta = initialTheta + totalRotation;
    sphericalCoords.phi = Math.max(0.01, Math.min(Math.PI - 0.01, sphericalCoords.phi + deltaY * sensitivityY));

    // Convert back to Cartesian coordinates
    const newPosition = sphericalToCartesian(sphericalCoords);

    // Update tag position
    draggedTag.position.copy(newPosition);
    draggedTag.element.setAttribute('position', newPosition);

    // Update look-at for non-door tags
    if (draggedTag.type !== 'door') {
        draggedTag.element.object3D.lookAt(new THREE.Vector3(0, 0, 0));
    }
};

const stopDragging = () => {
    if (isDragging) {
        isDragging = false;
        draggedTag = null;
        initialTheta = 0;
        totalRotation = 0;

        // Save the new position
        saveProjectToLocalStorage();
    }
};