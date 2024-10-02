// import { sceneEl, showNotification, createListItem, cameraEl, openRenameModal, openConfirmDeleteModal } from './uiManager.js';
// import { scenes, currentScene, switchScene } from './sceneManager.js';
// import { generateEntityId, vector3ToObject } from './utilities.js';

// //##################################################
// //#    MODEL
// //##################################################

// let placingDoor = false;
// let doorPosition = null;

// //##################################################
// //#    CONTROLLER
// //##################################################

// export const startPlacingDoor = () => {
//     if (!currentScene) {
//         showNotification('Please add a scene first.', 'error');
//         return;
//     }
//     if (scenes.length < 2) {
//         showNotification('Please add at least 2 scenes to add a door.', 'error');
//         return;
//     }
//     placingDoor = true;
//     showNotification('Click on the scene to place a door.', 'info');
//     document.getElementById('placeDoorButton').disabled = true;
// };

// export const handleSkyClickForDoor = (event) => {
//     if (placingDoor) {
//         const intersection = event.detail.intersection;
//         if (intersection) {
//             const cameraPosition = cameraEl.object3D.position.clone();
//             const intersectionPoint = intersection.point.clone();

//             const distance = cameraPosition.distanceTo(intersectionPoint);
//             const maxDistance = 10;

//             if (distance > maxDistance) {
//                 const directionVector = intersectionPoint.sub(cameraPosition).normalize();
//                 doorPosition = cameraPosition.add(directionVector.multiplyScalar(maxDistance));
//             } else {
//                 doorPosition = intersectionPoint;
//             }

//             openDoorPlacementModal();
//         }
//     }
// };

// export const cancelPlacingDoor = () => {
//     placingDoor = false;
//     doorPosition = null;
//     showNotification('', 'info');
//     document.getElementById('placeDoorButton').disabled = false;
// };

// const updateDoorDestination = (doorData, newDestinationSceneId) => {
//     doorData.destinationSceneId = newDestinationSceneId;
//     doorData.element.setAttribute('door-destination', newDestinationSceneId);

//     const destinationScene = scenes.find((s) => s.id === newDestinationSceneId);
//     if (doorData.labelElement) {
//         doorData.labelElement.setAttribute('value', destinationScene.name);
//     }

//     updateDoorList();
// };


// const onDoorClick = function () {
//     const destinationSceneId = this.getAttribute('door-destination');
//     switchScene(destinationSceneId);
// };

// //##################################################
// //#    VUE
// //##################################################

// const openDoorPlacementModal = () => {
//     const destinationSceneListEl = document.getElementById('destinationSceneList');
//     destinationSceneListEl.innerHTML = '';
//     const fragment = document.createDocumentFragment();
//     scenes
//         .filter((scene) => scene.id !== currentScene.id)
//         .forEach((scene) => {
//             const li = document.createElement('li');
//             li.textContent = scene.name;
//             li.dataset.sceneId = scene.id;
//             li.classList.add('scene-link');
//             li.addEventListener('click', () => selectDestinationScene(scene.id));
//             fragment.appendChild(li);
//         });
//     destinationSceneListEl.appendChild(fragment);
//     document.getElementById('doorPlacementModal').style.display = 'block';
//     showNotification('', 'info');
// };

// const selectDestinationScene = function (destinationSceneId) {
//     const doorId = generateEntityId('door');
//     const doorData = {
//         id: doorId,
//         name: `Door ${currentScene.doors.length + 1}`,
//         position: doorPosition.clone(),
//         destinationSceneId: destinationSceneId,
//     };

//     currentScene.doors.push(doorData);
//     createDoor(doorData);
//     updateDoorList();

//     placingDoor = false;
//     doorPosition = null;
//     document.getElementById('doorPlacementModal').style.display = 'none';
//     document.getElementById('placeDoorButton').disabled = false;
// };

// export const createDoor = function (doorData) {
//     const doorEl = document.createElement('a-box');
//     doorEl.setAttribute('color', '#4CC3D9');
//     doorEl.setAttribute('height', 2);
//     doorEl.setAttribute('width', 1);
//     doorEl.setAttribute('depth', 0.1);
//     doorEl.setAttribute('position', vector3ToObject(doorData.position));
//     doorEl.setAttribute('class', 'door clickable');
//     doorEl.setAttribute('door-destination', doorData.destinationSceneId);
//     doorEl.setAttribute('door-id', doorData.id);
//     doorEl.setAttribute('look-at', '#camera');

//     const destinationScene = scenes.find((s) => s.id === doorData.destinationSceneId);
//     const labelEl = document.createElement('a-text');
//     labelEl.setAttribute('value', destinationScene.name);
//     labelEl.setAttribute('align', 'center');
//     labelEl.setAttribute('color', '#FFFFFF');
//     labelEl.setAttribute('width', 4);
//     labelEl.setAttribute('position', { x: 0, y: 1.5, z: 0 });
//     labelEl.setAttribute('look-at', '#camera');
//     doorEl.appendChild(labelEl);
//     doorData.labelElement = labelEl;

//     doorEl.addEventListener('click', onDoorClick);
//     doorEl.addEventListener('select', onDoorClick);

//     doorEl.addEventListener('raycaster-intersected', () => {
//         doorEl.setAttribute('color', '#FFD700');
//     });
//     doorEl.addEventListener('raycaster-intersected-cleared', () => {
//         doorEl.setAttribute('color', '#4CC3D9');
//     });

//     sceneEl.appendChild(doorEl);
//     doorData.element = doorEl;
// };

// export const updateDoorList = function () {
//     const doorListEl = document.getElementById('doorList');
//     doorListEl.innerHTML = '';
//     const fragment = document.createDocumentFragment();
//     currentScene.doors.forEach((doorData) => {
//         const destinationScene = scenes.find(
//             (s) => s.id === doorData.destinationSceneId
//         );
//         const destinationName = destinationScene ? destinationScene.name : 'Unknown';
//         const li = createListItem(
//             {
//                 id: doorData.id,
//                 name: doorData.name,
//                 destinationSceneId: doorData.destinationSceneId,
//             },
//             'door',
//             {
//                 destinationOptions: scenes.filter((s) => s.id !== currentScene.id),
//                 onDestinationChange: (newDestinationSceneId) => {
//                     updateDoorDestination(doorData, newDestinationSceneId);
//                 },
//                 onRename: () => renameDoor(doorData.id),
//                 onDelete: () => deleteDoor(doorData.id),
//             }
//         );
//         fragment.appendChild(li);
//     });
//     doorListEl.appendChild(fragment);
// };

// const deleteDoor = function (doorId) {
//     openConfirmDeleteModal(
//         'Delete Door',
//         'Are you sure you want to delete this door?',
//         () => {
//             const doorIndex = currentScene.doors.findIndex((d) => d.id === doorId);
//             if (doorIndex !== -1) {
//                 const doorData = currentScene.doors[doorIndex];
//                 doorData.element.removeEventListener('click', onDoorClick);
//                 doorData.element.parentNode.removeChild(doorData.element);
//                 currentScene.doors.splice(doorIndex, 1);
//                 updateDoorList();
//             }
//         }
//     );
// };



// const renameDoor = (doorId) => {
//     const doorData = currentScene.doors.find((d) => d.id === doorId);
//     if (doorData) {
//         openRenameModal('Rename Door', doorData.name, (newName) => {
//             if (newName && newName.trim() !== '') {
//                 doorData.name = newName.trim();
//                 updateDoorList();
//             }
//         });
//     }
// };
