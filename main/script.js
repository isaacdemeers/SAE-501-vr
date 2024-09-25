const sceneEl = document.querySelector('a-scene');
const assetsEl = document.querySelector('#assets');
const skyEl = document.querySelector('#sky');
const cameraEl = document.querySelector('#camera');
const sceneListEl = document.getElementById('sceneList');
const destinationSceneListEl = document.getElementById('destinationSceneList');
const doorListEl = document.getElementById('doorList');
const doorPlacementModal = document.getElementById('doorPlacementModal');
const cancelDoorPlacementButton = document.getElementById('cancelDoorPlacementButton');
const placeDoorButton = document.getElementById('placeDoorButton');
const notificationEl = document.getElementById('notification');

const addTextButton = document.getElementById('addTextButton');
const textPlacementModal = document.getElementById('textPlacementModal');
const textContentInput = document.getElementById('textContentInput');
const confirmTextPlacementButton = document.getElementById('confirmTextPlacementButton');
const cancelTextPlacementButton = document.getElementById('cancelTextPlacementButton');
const textListEl = document.getElementById('textList');

const textEditModal = document.getElementById('textEditModal');
const editTextContentInput = document.getElementById('editTextContentInput');
const confirmTextEditButton = document.getElementById('confirmTextEditButton');
const cancelTextEditButton = document.getElementById('cancelTextEditButton');

const doorEditModal = document.getElementById('doorEditModal');
const editDestinationSceneListEl = document.getElementById('editDestinationSceneList');
const cancelDoorEditButton = document.getElementById('cancelDoorEditButton');

let scenes = [];
let currentScene = null;
let placingText = false;
let textPosition = null;
let currentEditingText = null;

document.getElementById('addSceneButton').addEventListener('click', () => {
    const fileInput = document.getElementById('sceneImageUpload');
    const file = fileInput.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        addScene(url);
        fileInput.value = '';
    } else {
        showNotification('Please select an image to upload.', 'error');
    }
});

function addScene(imageSrc) {
    const sceneId = 'scene' + scenes.length;

    const imgEl = document.createElement('img');
    imgEl.setAttribute('id', sceneId + '-image');
    imgEl.setAttribute('src', imageSrc);
    assetsEl.appendChild(imgEl);

    const sceneData = {
        id: sceneId,
        name: 'Scene ' + (scenes.length + 1),
        image: '#' + imgEl.getAttribute('id'),
        doors: [],
        texts: []
    };

    scenes.push(sceneData);

    addSceneToUI(sceneData);

    if (!currentScene) {
        switchScene(sceneId);
    }
}

function addSceneToUI(sceneData) {
    const li = document.createElement('li');
    li.dataset.sceneId = sceneData.id;

    const sceneLink = document.createElement('span');
    sceneLink.textContent = sceneData.name;
    sceneLink.classList.add('scene-link');
    sceneLink.addEventListener('click', () => {
        switchScene(sceneData.id);
    });

    const renameButton = document.createElement('button');
    renameButton.textContent = 'Rename';
    renameButton.classList.add('rename-button');
    renameButton.addEventListener('click', () => {
        renameScene(sceneData.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => {
        deleteScene(sceneData.id);
    });

    li.appendChild(sceneLink);
    li.appendChild(renameButton);
    li.appendChild(deleteButton);
    sceneListEl.appendChild(li);

    sceneData.listItemElement = li;
}

function switchScene(sceneId) {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
        currentScene = scene;

        const imgEl = document.querySelector(scene.image);
        if (!imgEl.complete) {
            imgEl.addEventListener('load', () => {
                skyEl.setAttribute('material', 'src', scene.image);
            });
        } else {
            skyEl.setAttribute('material', 'src', scene.image);
        }

        const existingDoors = document.querySelectorAll('.door');
        existingDoors.forEach(door => door.parentNode.removeChild(door));

        scene.doors.forEach(doorData => {
            createDoor(doorData);
        });

        const existingTexts = document.querySelectorAll('.text-element');
        existingTexts.forEach(text => text.parentNode.removeChild(text));

        scene.texts.forEach(textData => {
            createText(textData);
        });

        updateDoorList();
        updateTextList();

        highlightCurrentScene();
    }
}

function highlightCurrentScene() {
    const sceneItems = sceneListEl.querySelectorAll('li');
    sceneItems.forEach(item => {
        if (item.dataset.sceneId === currentScene.id) {
            item.style.fontWeight = 'bold';
        } else {
            item.style.fontWeight = 'normal';
        }
    });
}

function updateDoorList() {
    doorListEl.innerHTML = '';
    currentScene.doors.forEach((doorData, index) => {
        const li = document.createElement('li');
        li.dataset.doorId = doorData.id;

        const destinationScene = scenes.find(s => s.id === doorData.destinationSceneId);
        const destinationName = destinationScene ? destinationScene.name : 'Unknown';

        const doorLink = document.createElement('span');
        doorLink.textContent = 'Door to ' + destinationName;
        doorLink.classList.add('door-link');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            editDoorDestination(doorData.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            deleteDoor(doorData.id);
        });

        li.appendChild(doorLink);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        doorListEl.appendChild(li);
    });
}

let placingDoor = false;
let doorPosition = null;

placeDoorButton.addEventListener('click', () => {
    if (!currentScene) {
        showNotification('Please add a scene first.', 'error');
        return;
    }
    placingDoor = true;
    showNotification('Click on the scene to place a door.', 'info');
    placeDoorButton.disabled = true;
});

skyEl.addEventListener('click', function (event) {
    if (placingDoor) {
        const intersection = event.detail.intersection;
        if (intersection) {
            doorPosition = intersection.point;
            openDoorPlacementModal();
        } else {
            showNotification('Unable to determine click position.', 'error');
            placingDoor = false;
            placeDoorButton.disabled = false;
        }
    }
});

function openDoorPlacementModal() {
    destinationSceneListEl.innerHTML = '';
    scenes.forEach((scene, index) => {
        if (scene.id !== currentScene.id) {
            const li = document.createElement('li');
            li.textContent = scene.name;
            li.dataset.sceneId = scene.id;
            li.classList.add('scene-link');
            li.addEventListener('click', () => {
                selectDestinationScene(scene.id);
            });
            destinationSceneListEl.appendChild(li);
        }
    });
    doorPlacementModal.style.display = 'block';
    hideNotification();
}

cancelDoorPlacementButton.addEventListener('click', () => {
    placingDoor = false;
    doorPlacementModal.style.display = 'none';
    doorPosition = null;
    placeDoorButton.disabled = false;
});

function selectDestinationScene(destinationSceneId) {
    const doorId = 'door' + Date.now();

    const doorData = {
        id: doorId,
        position: doorPosition,
        destinationSceneId: destinationSceneId
    };

    currentScene.doors.push(doorData);

    createDoor(doorData);

    updateDoorList();

    placingDoor = false;
    doorPosition = null;
    doorPlacementModal.style.display = 'none';
    placeDoorButton.disabled = false;
}

function createDoor(doorData) {
    const doorEl = document.createElement('a-box');
    doorEl.setAttribute('color', '#4CC3D9');
    doorEl.setAttribute('height', 1);
    doorEl.setAttribute('width', 1);
    doorEl.setAttribute('depth', 1);

    const cameraPosition = cameraEl.object3D.position.clone();
    const directionVector = doorData.position.clone().sub(cameraPosition).normalize();
    const doorDistance = 4;
    const doorPosition = cameraPosition.add(directionVector.multiplyScalar(doorDistance));

    doorEl.setAttribute('position', doorPosition);
    doorEl.setAttribute('class', 'door clickable');
    doorEl.setAttribute('look-at', '#camera');
    doorEl.setAttribute('door-destination', doorData.destinationSceneId);
    doorEl.setAttribute('door-id', doorData.id);
    doorEl.addEventListener('click', onDoorClick);
    sceneEl.appendChild(doorEl);

    doorData.element = doorEl;
}

function onDoorClick(event) {
    const destinationSceneId = this.getAttribute('door-destination');
    switchScene(destinationSceneId);
}

function deleteDoor(doorId) {
    const doorIndex = currentScene.doors.findIndex(d => d.id === doorId);
    if (doorIndex !== -1) {
        const doorData = currentScene.doors[doorIndex];
        if (doorData.element && doorData.element.parentNode) {
            doorData.element.parentNode.removeChild(doorData.element);
        }
        currentScene.doors.splice(doorIndex, 1);

        updateDoorList();
    }
}

function editDoorDestination(doorId) {
    const doorData = currentScene.doors.find(d => d.id === doorId);
    if (doorData) {
        doorEditModal.doorData = doorData;

        editDestinationSceneListEl.innerHTML = '';
        scenes.forEach((scene, index) => {
            if (scene.id !== currentScene.id) {
                const li = document.createElement('li');
                li.textContent = scene.name;
                li.dataset.sceneId = scene.id;
                li.classList.add('scene-link');
                li.addEventListener('click', () => {
                    updateDoorDestination(doorData, scene.id);
                });
                editDestinationSceneListEl.appendChild(li);
            }
        });
        doorEditModal.style.display = 'block';
    }
}

cancelDoorEditButton.addEventListener('click', () => {
    doorEditModal.style.display = 'none';
});

function updateDoorDestination(doorData, newDestinationSceneId) {
    doorData.destinationSceneId = newDestinationSceneId;

    if (doorData.element) {
        doorData.element.setAttribute('door-destination', newDestinationSceneId);
    }
    updateDoorList();

    doorEditModal.style.display = 'none';
}

addTextButton.addEventListener('click', () => {
    if (!currentScene) {
        showNotification('Please add a scene first.', 'error');
        return;
    }
    placingText = true;
    showNotification('Click on the scene to place the text.', 'info');
    addTextButton.disabled = true;
});

skyEl.addEventListener('click', function (event) {
    if (placingText) {
        const intersection = event.detail.intersection;
        if (intersection) {
            textPosition = intersection.point;
            openTextPlacementModal();
        } else {
            showNotification('Unable to determine click position.', 'error');
            placingText = false;
            addTextButton.disabled = false;
        }
    }
});

function openTextPlacementModal() {
    textContentInput.value = '';
    textPlacementModal.style.display = 'block';
    hideNotification();
}

cancelTextPlacementButton.addEventListener('click', () => {
    placingText = false;
    textPlacementModal.style.display = 'none';
    textPosition = null;
    addTextButton.disabled = false;
});

confirmTextPlacementButton.addEventListener('click', () => {
    const textContent = textContentInput.value.trim();
    if (textContent === '') {
        showNotification('Text content cannot be empty.', 'error');
        return;
    }
    const textId = 'text' + Date.now();

    const textData = {
        id: textId,
        name: 'Text ' + (currentScene.texts.length + 1), // Default name
        content: textContent,
        position: textPosition
    };

    currentScene.texts.push(textData);

    createText(textData);

    updateTextList();

    placingText = false;
    textPosition = null;
    textPlacementModal.style.display = 'none';
    addTextButton.disabled = false;
});

function createText(textData) {
    const textEl = document.createElement('a-text');
    textEl.setAttribute('value', textData.content);
    textEl.setAttribute('color', '#FFFFFF');
    textEl.setAttribute('align', 'center');
    textEl.setAttribute('width', 4);

    const cameraPosition = cameraEl.object3D.position.clone();
    const directionVector = textData.position.clone().sub(cameraPosition).normalize();
    const textDistance = 4;
    const textPosition = cameraPosition.add(directionVector.multiplyScalar(textDistance));

    textEl.setAttribute('position', textPosition);
    textEl.setAttribute('class', 'text-element clickable');
    textEl.setAttribute('look-at', '#camera');
    textEl.setAttribute('text-id', textData.id);
    textEl.addEventListener('click', onTextClick);
    sceneEl.appendChild(textEl);

    textData.element = textEl;
}

function onTextClick(event) {
    const textId = this.getAttribute('text-id');
    const textData = currentScene.texts.find(t => t.id === textId);
    if (textData) {
        currentEditingText = textData;
        openTextEditModal(textData);
    }
}

function openTextEditModal(textData) {
    editTextContentInput.value = textData.content;
    textEditModal.style.display = 'block';
}

confirmTextEditButton.addEventListener('click', () => {
    const newTextContent = editTextContentInput.value.trim();
    if (newTextContent === '') {
        showNotification('Text content cannot be empty.', 'error');
        return;
    }
    currentEditingText.content = newTextContent;

    if (currentEditingText.element) {
        currentEditingText.element.setAttribute('value', newTextContent);
    }

    updateTextList();

    textEditModal.style.display = 'none';
    currentEditingText = null;
});

cancelTextEditButton.addEventListener('click', () => {
    textEditModal.style.display = 'none';
    currentEditingText = null;
});

function updateTextList() {
    textListEl.innerHTML = '';
    currentScene.texts.forEach((textData, index) => {
        const li = document.createElement('li');
        li.dataset.textId = textData.id;

        const textLink = document.createElement('span');
        textLink.textContent = textData.name;
        textLink.classList.add('text-link');
        textLink.addEventListener('click', () => {

        });

        const renameButton = document.createElement('button');
        renameButton.textContent = 'Rename';
        renameButton.classList.add('rename-button');
        renameButton.addEventListener('click', () => {
            renameText(textData.id);
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            currentEditingText = textData;
            openTextEditModal(textData);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            deleteText(textData.id);
        });

        li.appendChild(textLink);
        li.appendChild(renameButton);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        textListEl.appendChild(li);
    });
}

function deleteText(textId) {
    const textIndex = currentScene.texts.findIndex(t => t.id === textId);
    if (textIndex !== -1) {
        const textData = currentScene.texts[textIndex];
        if (textData.element && textData.element.parentNode) {
            textData.element.parentNode.removeChild(textData.element);
        }
        currentScene.texts.splice(textIndex, 1);

        updateTextList();
    }
}

function renameText(textId) {
    const textData = currentScene.texts.find(t => t.id === textId);
    if (textData) {
        const newName = prompt('Enter a new name for the text:', textData.name);
        if (newName && newName.trim() !== '') {
            textData.name = newName.trim();

            updateTextList();
        }
    }
}


function deleteScene(sceneId) {
    if (!confirm('Are you sure you want to delete this scene?')) {
        return;
    }

    const sceneIndex = scenes.findIndex(s => s.id === sceneId);
    if (sceneIndex !== -1) {
        const scene = scenes.splice(sceneIndex, 1)[0];

        const imgEl = document.querySelector(scene.image);
        if (imgEl && imgEl.parentNode) {
            imgEl.parentNode.removeChild(imgEl);
        }

        const sceneLi = sceneListEl.querySelector(`li[data-scene-id="${sceneId}"]`);
        if (sceneLi && sceneLi.parentNode) {
            sceneLi.parentNode.removeChild(sceneLi);
        }

        scenes.forEach(s => {
            s.doors = s.doors.filter(doorData => {
                if (doorData.destinationSceneId === sceneId) {
                    if (doorData.element && doorData.element.parentNode) {
                        doorData.element.parentNode.removeChild(doorData.element);
                    }
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
                const existingDoors = document.querySelectorAll('.door');
                existingDoors.forEach(door => door.parentNode.removeChild(door));
                doorListEl.innerHTML = '';
            }
        }
        if (currentScene) {
            updateDoorList();
        }
    }
}

function renameScene(sceneId) {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
        const newName = prompt('Enter a new name for the scene:', scene.name);
        if (newName && newName.trim() !== '') {
            scene.name = newName.trim();

            const sceneLi = sceneListEl.querySelector(`li[data-scene-id="${sceneId}"]`);
            if (sceneLi) {
                const sceneLink = sceneLi.querySelector('.scene-link');
                sceneLink.textContent = scene.name;
            }

            scenes.forEach(s => {
                s.doors.forEach(doorData => {
                    if (doorData.destinationSceneId === sceneId) {
                        if (s.id === currentScene.id) {
                            updateDoorList();
                        }
                    }
                });
            });
        }
    }
}

function showNotification(message, type = 'info') {
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';

    switch (type) {
        case 'error':
            notificationEl.style.backgroundColor = '#dc3545';
            break;
        case 'success':
            notificationEl.style.backgroundColor = '#28a745';
            break;
        default:
            notificationEl.style.backgroundColor = '#007BFF';
            break;
    }

    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, 3000);
}

function hideNotification() {
    notificationEl.style.display = 'none';
}