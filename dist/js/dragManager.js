import { cartesianToSpherical, sphericalToCartesian } from './utilities.js';
import { saveProjectToLocalStorage } from './storageManager.js';

let isDragging = false;
let draggedTag = null;
let lastSpherical = new THREE.Spherical();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 5); // Assuming a sphere radius of 5

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
    updateMousePosition(event, sceneEl);
    lastSpherical.setFromVector3(tagData.position);
    event.preventDefault();
    event.stopPropagation();
};

const dragTag = (event, tagData, sceneEl) => {
    if (!isDragging || !draggedTag) return;

    updateMousePosition(event, sceneEl);
    const camera = sceneEl.camera;
    raycaster.setFromCamera(mouse, camera);

    const intersection = new THREE.Vector3();
    if (raycaster.ray.intersectSphere(sphere, intersection)) {
        const newSpherical = new THREE.Spherical().setFromVector3(intersection);

        // Calculate the change in spherical coordinates
        const deltaTheta = newSpherical.theta - lastSpherical.theta;
        const deltaPhi = newSpherical.phi - lastSpherical.phi;

        // Update the tag's spherical coordinates
        const tagSpherical = new THREE.Spherical().setFromVector3(tagData.position);
        tagSpherical.theta += deltaTheta;
        tagSpherical.phi += deltaPhi;

        // Ensure phi stays within bounds
        tagSpherical.phi = Math.max(0.01, Math.min(Math.PI - 0.01, tagSpherical.phi));

        // Convert back to Cartesian coordinates
        const newPosition = new THREE.Vector3().setFromSpherical(tagSpherical);

        tagData.position.copy(newPosition);
        tagData.element.setAttribute('position', newPosition);

        lastSpherical.copy(newSpherical);
    }
};

const stopDragging = (tagData) => {
    if (isDragging) {
        isDragging = false;
        draggedTag = null;
        saveProjectToLocalStorage();
    }
};

const updateMousePosition = (event, sceneEl) => {
    const bounds = sceneEl.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
};