import { generateEntityId, resetIdCounters, getIdCounters } from './utilities.js';
import { updateDoorList, createDoor } from './doorManager.js';
import { updateTextList, createText } from './textManager.js';
import {
    showNotification,
    createListItem,
    openRenameModal,
    openConfirmDeleteModal,
    assetsEl,
    skyEl,
} from './uiManager.js';

export let scenes = [];
export let currentScene = null;

export const addScenesFromAssets = (imageNames) => {
    if (imageNames.length === 0) {
        showNotification('No images selected.', 'error');
        return;
    }

    imageNames.forEach((imageName) => {
        const imageSrc = `assets/${imageName}`;
        addScene(imageSrc, imageName);
    });
};

const addScene = (imageSrc, imageName, sceneDataInput) => {
    const sceneId = sceneDataInput?.id || generateEntityId('scene');

    imageSrc = sceneDataInput?.imageSrc || imageSrc;

    let imgEl = document.querySelector(`#${CSS.escape(sceneId)}-image`);
    if (!imgEl) {
        imgEl = document.createElement('img');
        imgEl.setAttribute('id', `${sceneId}-image`);
        imgEl.setAttribute('src', imageSrc);
        assetsEl.appendChild(imgEl);
    }

    const sceneData = {
        id: sceneId,
        name: sceneDataInput?.name || imageName || `Scene ${scenes.length + 1}`,
        image: `#${imgEl.getAttribute('id')}`,
        imageSrc: imageSrc,
        doors: [],
        texts: [],
    };

    scenes.push(sceneData);
    updateSceneSelect();

    if (!currentScene || sceneDataInput) {
        switchScene(sceneId);
    }
};

export const switchScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        currentScene = scene;
        skyEl.setAttribute('material', 'src', scene.image);

        document.querySelectorAll('.door, .text-element').forEach((el) => {
            el.parentNode.removeChild(el);
        });

        scene.doors.forEach((doorData) => createDoor(doorData));
        scene.texts.forEach((textData) => createText(textData));

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
    updateSceneManagementModal();
    document.getElementById('sceneManagementModal').style.display = 'block';
};

export const updateSceneManagementModal = () => {
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
};

const deleteScene = (sceneId) => {
    openConfirmDeleteModal(
        'Delete Scene',
        'Are you sure you want to delete this scene?',
        () => {
            const sceneIndex = scenes.findIndex((s) => s.id === sceneId);
            if (sceneIndex !== -1) {
                const scene = scenes.splice(sceneIndex, 1)[0];
                const imgEl = document.querySelector(scene.image);
                if (imgEl && imgEl.parentNode) {
                    assetsEl.removeChild(imgEl);
                }

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
                updateSceneManagementModal();
            }
        }
    );
};

const renameScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        openRenameModal('Rename Scene', scene.name, (newName) => {
            if (newName && newName.trim() !== '') {
                scene.name = newName.trim();
                updateSceneSelect();
                updateDoorList();
                updateSceneManagementModal();
            }
        });
    }
};

export const initializeScene = () => {
    showNotification('Welcome! Please add scenes to get started.', 'info');
};

export const exportProjectData = () => {
    const scenesCopy = scenes.map((scene) => {
        const sceneCopy = { ...scene };
        sceneCopy.doors = scene.doors.map((doorData) => {
            const { element, labelElement, position, ...rest } = doorData;
            return {
                ...rest,
                position: position.toArray(),
            };
        });
        sceneCopy.texts = scene.texts.map((textData) => {
            const { element, position, ...rest } = textData;
            return {
                ...rest,
                position: position.toArray(),
            };
        });
        sceneCopy.imageSrc = scene.imageSrc;
        delete sceneCopy.image;
        return sceneCopy;
    });

    const projectData = {
        scenes: scenesCopy,
        idCounters: getIdCounters(),
    };
    return projectData;
};

export const importProjectData = (projectData) => {
    scenes = [];
    currentScene = null;
    document.getElementById('doorList').innerHTML = '';
    document.getElementById('textList').innerHTML = '';

    assetsEl.innerHTML = '';

    resetIdCounters(projectData.idCounters || { scene: 0, door: 0, text: 0 });

    projectData.scenes.forEach((sceneData) => {
        const imageSrc = sceneData.imageSrc;
        addScene(imageSrc, sceneData.name, { ...sceneData, doors: [], texts: [] });
    });

    projectData.scenes.forEach((sceneData) => {
        const existingScene = scenes.find((s) => s.id === sceneData.id);
        if (existingScene) {
            sceneData.doors.forEach((doorDataInput) => {
                const position = new THREE.Vector3().fromArray(doorDataInput.position);
                const doorData = {
                    ...doorDataInput,
                    position,
                };
                existingScene.doors.push(doorData);
                if (currentScene && currentScene.id === existingScene.id) {
                    createDoor(doorData);
                }
            });

            sceneData.texts.forEach((textDataInput) => {
                const position = new THREE.Vector3().fromArray(textDataInput.position);
                const textData = {
                    ...textDataInput,
                    position,
                };
                existingScene.texts.push(textData);
                if (currentScene && currentScene.id === existingScene.id) {
                    createText(textData);
                }
            });
        }
    });

    if (scenes.length > 0) {
        switchScene(scenes[0].id);
    }
};
