import { generateEntityId, resetIdCounters, getIdCounters } from './utilities.js';
import { createTag, updateTagList } from './tagManager.js';
import {
    showNotification,
    createListItem,
    openRenameModal,
    openConfirmDeleteModal,
    assetsEl,
    skyEl,
    updateTagButtonsState,
} from './uiManager.js';

export let scenes = [];
export let currentScene = null;

export const addScenesFromAssets = (sceneNames) => {
    if (sceneNames.length === 0) {
        showNotification('Aucune scène sélectionnée.', 'error');
        return;
    }

    sceneNames.forEach((sceneName) => {
        const mediaSrc = `assets/${sceneName}`;
        addScene(mediaSrc, sceneName);
    });
};

const addScene = (mediaSrc, mediaName, sceneDataInput) => {
    const sceneId = sceneDataInput?.id || generateEntityId('scene');

    mediaSrc = sceneDataInput?.mediaSrc || mediaSrc;

    const isVideo = /\.(mp4|webm|ogg)$/.test(mediaSrc.toLowerCase());

    let mediaEl = document.querySelector(`#${CSS.escape(sceneId)}-media`);
    if (!mediaEl) {
        if (isVideo) {
            mediaEl = document.createElement('video');
            mediaEl.setAttribute('id', `${sceneId}-media`);
            mediaEl.setAttribute('src', mediaSrc);
            mediaEl.setAttribute('crossorigin', 'anonymous');
            mediaEl.setAttribute('loop', 'true');
            mediaEl.setAttribute('preload', 'auto');
            assetsEl.appendChild(mediaEl);
        } else {
            mediaEl = document.createElement('img');
            mediaEl.setAttribute('id', `${sceneId}-media`);
            mediaEl.setAttribute('src', mediaSrc);
            assetsEl.appendChild(mediaEl);
        }
    }

    const sceneData = {
        id: sceneId,
        name: sceneDataInput?.name || mediaName || `Scene ${scenes.length + 1}`,
        media: `#${mediaEl.getAttribute('id')}`,
        mediaSrc: mediaSrc,
        isVideo: isVideo,
        tags: [],
    };

    scenes.push(sceneData);
    updateSceneSelect();

    if (!currentScene || sceneDataInput) {
        switchScene(sceneId);
    }

    updateTagButtonsState();
};

export const switchScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        currentScene = scene;

        if (scene.isVideo) {
            skyEl.setAttribute('material', {
                shader: 'flat',
                src: scene.media,
                autoplay: 'true',
                loop: 'true',
                side: 'back',
                transparent: 'false',
                color: '#FFFFFF',
            });

            const videoEl = document.querySelector(scene.media);
            if (videoEl) {
                videoEl.play();
            }
        } else {
            skyEl.setAttribute('material', 'src', scene.media);
        }

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
        'Supprimer la scène',
        'Êtes-vous sûr de vouloir supprimer cette scène ?',
        () => {
            const sceneIndex = scenes.findIndex((s) => s.id === sceneId);
            if (sceneIndex !== -1) {
                const scene = scenes.splice(sceneIndex, 1)[0];
                const mediaEl = document.querySelector(scene.media);
                if (mediaEl && mediaEl.parentNode) {
                    assetsEl.removeChild(mediaEl);
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

                updateTagButtonsState();
            }
        }
    );
};

const renameScene = (sceneId) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (scene) {
        openRenameModal('Renommer la scène', scene.name, (newName) => {
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
    showNotification('Bienvenue ! Veuillez ajouter des scènes pour commencer.', 'info');

    updateTagButtonsState();
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
        sceneCopy.mediaSrc = scene.mediaSrc;
        sceneCopy.isVideo = scene.isVideo;
        delete sceneCopy.media;
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
        const mediaSrc = sceneData.mediaSrc;
        addScene(mediaSrc, sceneData.name, { ...sceneData, tags: [] });
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

    updateTagButtonsState();
};
