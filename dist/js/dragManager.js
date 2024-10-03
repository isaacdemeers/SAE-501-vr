import { saveProjectToLocalStorage } from './storageManager.js';
import { selectTag } from './tagManager.js'; // Add this import

let isDragging = false;
let draggedTag = null;
let lastMouseX = 0;
let lastMouseY = 0;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const scrollSpeed = 0.05;

let currentTagDistance = 5;
let updateTagPositionCallback = null;

export const initDraggable = (tagElement, tagData, sceneEl, updateTagPosition) => {
    updateTagPositionCallback = updateTagPosition;

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

    sceneEl.addEventListener('wheel', (event) => {
        if (isDragging) {
            adjustTagDistance(event, sceneEl);
        }
    });
};

const startDragging = (event, tagData, sceneEl) => {
    isDragging = true;
    draggedTag = tagData;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    // Set the initial distance when starting to drag
    const camera = sceneEl.camera;
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    currentTagDistance = cameraPosition.distanceTo(tagData.position);

    // Select the tag in the sidebar when starting to drag
    selectTag(tagData);

    event.preventDefault();
    event.stopPropagation();
};

const dragTag = (event, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    const camera = sceneEl.camera;
    updateMousePosition(event, sceneEl);
    raycaster.setFromCamera(mouse, camera);

    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    const sphere = new THREE.Sphere(cameraPosition, currentTagDistance);

    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectSphere(sphere, intersection)) {
        updateTagPositionCallback(draggedTag, intersection);

        // Update orientation
        if (draggedTag.type === 'door') {
            const normal = intersection.clone().normalize();
            const lookAtPoint = intersection.clone().add(normal);
            draggedTag.element.object3D.lookAt(lookAtPoint);
        } else {
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
        saveProjectToLocalStorage();
    }
};

const adjustTagDistance = (event, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    event.preventDefault();

    const distance = event.deltaY * scrollSpeed;
    currentTagDistance += distance;
    currentTagDistance = Math.max(1, Math.min(currentTagDistance, 20));

    const camera = sceneEl.camera;
    const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
    const direction = draggedTag.position.clone().sub(cameraPosition).normalize();
    const newPosition = cameraPosition.clone().add(direction.multiplyScalar(currentTagDistance));

    updateTagPositionCallback(draggedTag, newPosition);

    // Update orientation
    if (draggedTag.type === 'door') {
        const normal = newPosition.clone().normalize();
        const lookAtPoint = newPosition.clone().add(normal);
        draggedTag.element.object3D.lookAt(lookAtPoint);
    } else {
        draggedTag.element.object3D.lookAt(new THREE.Vector3(0, 0, 0));
    }

    saveProjectToLocalStorage();
};

const updateMousePosition = (event, sceneEl) => {
    const bounds = sceneEl.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};