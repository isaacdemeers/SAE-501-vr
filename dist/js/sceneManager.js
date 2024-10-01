import { generateEntityId, resetIdCounters, getIdCounters } from './utilities.js';
import { createTag, updateTagList } from './tagManager.js';
import {
    showNotification,
    createListItem,
    openRenameModal,
    openConfirmDeleteModal,
    assetsEl,
    skyEl,
    updateTagButtonsState, // Import de la fonction
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
        tags: [],
    };

    scenes.push(sceneData);
    updateSceneSelect();

    if (!currentScene || sceneDataInput) {
        switchScene(sceneId);
    }

    updateTagButtonsState(); // Mise à jour de l'état des boutons des tags après ajout d'une scène
};

export const switchScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        currentScene = scene;
        skyEl.setAttribute('material', 'src', scene.image);

        document.querySelectorAll('.tag-element').forEach((el) => {
            el.parentNode.removeChild(el);
        });

        scene.tags.forEach((tagData) => createTag(tagData));

        updateTagList();
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
                    s.tags = s.tags.filter((tagData) => {
                        if (tagData.destinationSceneId === sceneId) {
                            if (tagData.element && tagData.element.parentNode) {
                                tagData.element.parentNode.removeChild(tagData.element);
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
                        document.querySelectorAll('.tag-element').forEach((el) => {
                            el.parentNode.removeChild(el);
                        });
                        document.getElementById('tagList').innerHTML = '';
                    }
                } else {
                    updateTagList();
                }
                updateSceneSelect();
                updateSceneManagementModal();

                updateTagButtonsState(); // Mise à jour de l'état des boutons des tags après suppression d'une scène
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
                updateTagList();
                updateSceneManagementModal();
            }
        });
    }
};

export const initializeScene = () => {
    showNotification('Welcome! Please add scenes to get started.', 'info');

    updateTagButtonsState(); // Mise à jour de l'état des boutons des tags lors de l'initialisation
};

export const exportProjectData = () => {
    const scenesCopy = scenes.map((scene) => {
        const sceneCopy = { ...scene };
        sceneCopy.tags = scene.tags.map((tagData) => {
            const { element, position, ...rest } = tagData;
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
    document.getElementById('tagList').innerHTML = '';

    assetsEl.innerHTML = '';

    resetIdCounters(projectData.idCounters || { scene: 0, tag: 0 });

    projectData.scenes.forEach((sceneData) => {
        const imageSrc = sceneData.imageSrc;
        addScene(imageSrc, sceneData.name, { ...sceneData, tags: [] });
    });

    projectData.scenes.forEach((sceneData) => {
        const existingScene = scenes.find((s) => s.id === sceneData.id);
        if (existingScene) {
            sceneData.tags.forEach((tagDataInput) => {
                const position = new THREE.Vector3().fromArray(tagDataInput.position);
                const tagData = {
                    ...tagDataInput,
                    position,
                };
                existingScene.tags.push(tagData);
                if (currentScene && currentScene.id === existingScene.id) {
                    createTag(tagData);
                }
            });
        }
    });

    if (scenes.length > 0) {
        switchScene(scenes[0].id);
    }

    updateTagButtonsState(); // Mise à jour de l'état des boutons des tags après importation du projet
};
