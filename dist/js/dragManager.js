import { saveProjectToLocalStorage } from './storageManager.js';

let isDragging = false;
let draggedTag = null;
let lastMouseX = 0;
let lastMouseY = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 5); // Assuming a sphere radius of 5

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
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    event.preventDefault();
    event.stopPropagation();
};

const dragTag = (event, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    const camera = sceneEl.camera;
    updateMousePosition(event, sceneEl);
    raycaster.setFromCamera(mouse, camera);

    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectSphere(sphere, intersection)) {
        // Update tag position
        draggedTag.position.copy(intersection);
        draggedTag.element.setAttribute('position', intersection);

        // Update orientation
        if (draggedTag.type === 'door') {
            // Make doors face outward from the center
            const normal = intersection.clone().normalize();
            const lookAtPoint = intersection.clone().add(normal);
            draggedTag.element.object3D.lookAt(lookAtPoint);
        } else {
            // Make other tags face the center
            draggedTag.element.object3D.lookAt(new THREE.Vector3(0, 0, 0));
        }
    }

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
};

const stopDragging = () => {
    if (isDragging) {
        isDragging = false;
        draggedTag = null;

        // Save the new position
        saveProjectToLocalStorage();
    }
};

const updateMousePosition = (event, sceneEl) => {
    const bounds = sceneEl.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};