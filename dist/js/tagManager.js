import {
    sceneEl,
    showNotification,
    createListItem,
    cameraEl,
    openRenameModal,
    openConfirmDeleteModal,
    openMediaSelectionModal,
    openTextEditModal,
} from './uiManager.js';
import { currentScene, scenes, switchScene } from './sceneManager.js';
import { generateEntityId, vector3ToObject } from './utilities.js';
import { saveProjectToLocalStorage } from './storageManager.js';
import { initDraggable } from './dragManager.js';

let placingTag = false;
let tagPosition = null;
let placingTagType = null;
let selectedTag = null;
let highlightEl = null;

const updateTagPosition = (tagData, newPosition) => {
    tagData.position.copy(newPosition);
    tagData.element.setAttribute('position', newPosition);
    if (selectedTag === tagData) {
        highlightTagInScene(tagData);
    }
};

export const startPlacingTag = (type) => {
    if (!currentScene) {
        showNotification('Veuillez d\'abord ajouter une scène.', 'error');
        return;
    }
    placingTag = true;
    placingTagType = type;
    showNotification(`Cliquez sur la scène pour placer un ${type}.`, 'info');
    document.getElementById(`add${capitalizeFirstLetter(type)}Button`).disabled = true;
};

export const handleSkyClickForTag = (event) => {
    if (placingTag) {
        const intersection = event.detail.intersection;
        if (intersection) {
            const cameraPosition = cameraEl.object3D.position.clone();
            const intersectionPoint = intersection.point.clone();

            const distance = cameraPosition.distanceTo(intersectionPoint);
            const maxDistance = 10;

            if (distance > maxDistance) {
                const directionVector = intersectionPoint.sub(cameraPosition).normalize();
                tagPosition = cameraPosition.add(directionVector.multiplyScalar(maxDistance));
            } else {
                tagPosition = intersectionPoint;
            }

            openTagPlacementModal();
        }
    }
};

export const cancelPlacingTag = () => {
    if (placingTagType) {
        document.getElementById(`add${capitalizeFirstLetter(placingTagType)}Button`).disabled = false;
    }
    placingTag = false;
    tagPosition = null;
    placingTagType = null;
    showNotification('', 'info');
};

const openTagPlacementModal = () => {
    if (placingTagType === 'door') {
        const destinationSceneListEl = document.getElementById('destinationSceneList');
        destinationSceneListEl.innerHTML = '';
        const fragment = document.createDocumentFragment();
        scenes
            .filter((scene) => scene.id !== currentScene.id)
            .forEach((scene) => {
                const li = document.createElement('li');
                li.textContent = scene.name;
                li.dataset.sceneId = scene.id;
                li.classList.add('scene-link');
                li.addEventListener('click', () => selectDestinationScene(scene.id));
                fragment.appendChild(li);
            });
        destinationSceneListEl.appendChild(fragment);
        document.getElementById('doorPlacementModal').style.display = 'block';
    } else if (placingTagType === 'text') {
        document.getElementById('textContentInput').value = '';
        document.getElementById('textPlacementModal').style.display = 'flex';
    } else if (placingTagType === 'image' || placingTagType === 'video') {
        openMediaSelectionModal();
    }
    showNotification('', 'info');
};

const confirmTagPlacement = (content) => {
    const tagId = generateEntityId('tag');
    const tagData = {
        id: tagId,
        name: `${capitalizeFirstLetter(placingTagType)} ${currentScene.tags.length + 1}`,
        type: placingTagType,
        content: content || '',
        position: tagPosition.clone(),
        destinationSceneId: placingTagType === 'door' ? content : null,
        sceneId: currentScene.id,
    };

    currentScene.tags.push(tagData);

    if (currentScene.id === tagData.sceneId) {
        createTag(tagData);
    }

    updateTagList();
    placingTag = false;
    tagPosition = null;
    placingTagType = null;
    document.getElementById(`add${capitalizeFirstLetter(tagData.type)}Button`).disabled = false;

    saveProjectToLocalStorage();
};

const selectDestinationScene = (destinationSceneId) => {
    confirmTagPlacement(destinationSceneId);
    document.getElementById('doorPlacementModal').style.display = 'none';
};

export const confirmTextPlacement = () => {
    const textContent = document.getElementById('textContentInput').value.trim();
    if (textContent === '') {
        showNotification('Le contenu du texte ne peut pas être vide.', 'error');
        return;
    }
    confirmTagPlacement(textContent);
    document.getElementById('textPlacementModal').style.display = 'none';
};

export const confirmMediaSelection = (selectedMedia) => {
    if (selectedMedia) {
        confirmTagPlacement(`assets/${selectedMedia}`);
        document.getElementById('mediaSelectionModal').style.display = 'none';
    } else {
        showNotification('Aucun média sélectionné.', 'error');
    }
};

export const createTag = (tagData) => {
    if (tagData.type === 'door') {
        createContentElement(tagData);
        tagData.contentVisible = true;
    } else {
        createPlaceholder(tagData);
        tagData.contentVisible = false;
    }

    initDraggable(tagData.element, tagData, sceneEl, updateTagPosition);
};

const createPlaceholder = (tagData) => {
    // const placeholderEl = document.createElement('a-sphere');
    // placeholderEl.setAttribute('radius', 0.5);
    // placeholderEl.setAttribute('color', '#FFC107');
    // placeholderEl.setAttribute('position', vector3ToObject(tagData.position));
    // placeholderEl.setAttribute('class', 'tag-element clickable');
    // placeholderEl.setAttribute('tag-id', tagData.id);
    // placeholderEl.setAttribute('look-at', '#camera');

    const placeholderEl = document.createElement('a-entity');
    placeholderEl.setAttribute('look-at', '#camera');
    placeholderEl.setAttribute('position', vector3ToObject(tagData.position));


    const childEl = document.createElement('a-entity');
    if (tagData.type === 'text') {
        childEl.setAttribute('gltf-model', './assets/models/info.glb');
        childEl.setAttribute('scale', '3 3 3');
        childEl.setAttribute('rotation', '0 90 0');


    }
    else if (tagData.type === 'image') {
        childEl.setAttribute('gltf-model', './assets/models/picture.glb');
        childEl.setAttribute('scale', '0.12,0.12, 0.12');
        childEl.setAttribute('rotation', '0 180 0');


    }
    childEl.setAttribute('class', 'tag-element clickable');
    childEl.setAttribute('tag-id', tagData.id);

    placeholderEl.appendChild(childEl);

    let clickTimeout;
    placeholderEl.addEventListener('click', (event) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            onTagDoubleClick(tagData);
        } else {
            clickTimeout = setTimeout(() => {
                clickTimeout = null;
            }, 300);
        }
    });

    initDraggable(placeholderEl, tagData, sceneEl);

    sceneEl.appendChild(placeholderEl);
    tagData.element = placeholderEl;
};

const createContentElement = (tagData) => {
    let contentEl;
    if (tagData.type === 'text') {
        contentEl = document.createElement('a-text');
        contentEl.setAttribute('value', tagData.content);
        contentEl.setAttribute('color', '#FFFFFF');
        contentEl.setAttribute('align', 'center');
        contentEl.setAttribute('width', 10);
    } else if (tagData.type === 'door') {
        contentEl = document.createElement('a-entity');
        contentEl.setAttribute('gltf-model', './assets/models/door.glb');
        contentEl.setAttribute('scale', '1, 1, 1');
        contentEl.setAttribute('class', 'tag-element clickable');

        let clickTimeout;
        contentEl.addEventListener('click', (event) => {
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
                switchScene(tagData.destinationSceneId);
            } else {
                clickTimeout = setTimeout(() => {
                    clickTimeout = null;
                }, 300);
            }
        });

        const destinationScene = scenes.find((s) => s.id === tagData.destinationSceneId);
        const labelEl = document.createElement('a-text');
        labelEl.setAttribute('value', destinationScene ? destinationScene.name : 'Inconnu');
        labelEl.setAttribute('align', 'center');
        labelEl.setAttribute('color', '#FFFFFF');
        labelEl.setAttribute('width', 4);
        labelEl.setAttribute('position', { x: 0, y: 1.5, z: 0 });
        labelEl.setAttribute('look-at', '#camera');
        contentEl.appendChild(labelEl);
    } else if (tagData.type === 'image') {
        contentEl = document.createElement('a-image');
        contentEl.setAttribute('src', tagData.content);
        contentEl.setAttribute('look-at', '#camera');

        contentEl.addEventListener('materialtextureloaded', () => {
            const img = contentEl.components.material.material.map.image;
            if (img) {
                const aspect = img.width / img.height;
                contentEl.setAttribute('width', 4);
                contentEl.setAttribute('height', 4 / aspect);
            } else {
                contentEl.setAttribute('width', 4);
                contentEl.setAttribute('height', 2);
            }
        });
    } else if (tagData.type === 'video') {
        contentEl = document.createElement('a-video');
        contentEl.setAttribute('src', tagData.content);
        contentEl.setAttribute('autoplay', 'true');
        contentEl.setAttribute('loop', 'true');
        contentEl.setAttribute('look-at', '#camera');
        contentEl.setAttribute('mute', 'true');

        contentEl.addEventListener('componentchanged', (evt) => {
            if (evt.detail.name === 'visible') {
                const videoEl = contentEl.components.material.material.map.image;
                if (videoEl) {
                    if (contentEl.getAttribute('visible')) {
                        videoEl.play();
                    } else {
                        videoEl.pause();
                    }
                }
            }
        });

        contentEl.addEventListener('loadedmetadata', () => {
            const video = contentEl.components.material.material.map.image;
            if (video) {
                const aspect = video.videoWidth / video.videoHeight;
                contentEl.setAttribute('width', 4);
                contentEl.setAttribute('height', 4 / aspect);
            } else {
                contentEl.setAttribute('width', 4);
                contentEl.setAttribute('height', 2);
            }
        });
    }

    contentEl.setAttribute('position', vector3ToObject(tagData.position));
    contentEl.setAttribute('class', 'tag-element clickable');
    contentEl.setAttribute('look-at', '#camera');

    initDraggable(contentEl, tagData, sceneEl, updateTagPosition);

    let clickTimeout;
    contentEl.addEventListener('click', (event) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            onTagDoubleClick(tagData);
        } else {
            clickTimeout = setTimeout(() => {
                clickTimeout = null;
            }, 300);
        }
    });

    sceneEl.appendChild(contentEl);
    tagData.element = contentEl;
};

const onTagDoubleClick = (tagData) => {
    if (tagData.type === 'door') {
        return;
    }

    if (tagData.contentVisible) {
        if (tagData.element && tagData.element.parentNode) {
            tagData.element.parentNode.removeChild(tagData.element);
        }
        createPlaceholder(tagData);
        tagData.contentVisible = false;
    } else {
        if (tagData.element && tagData.element.parentNode) {
            tagData.element.parentNode.removeChild(tagData.element);
        }
        createContentElement(tagData);
        tagData.contentVisible = true;
    }

    initDraggable(tagData.element, tagData, sceneEl, updateTagPosition);
};

export const updateTagList = () => {
    const tagListEl = document.getElementById('tagList');
    tagListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();
    currentScene.tags.forEach((tagData) => {
        const li = createListItem(tagData, 'tag', {
            onContentChange: (newContent) => {
                updateTagContent(tagData, newContent);
            },
            onRename: () => renameTag(tagData.id),
            onDelete: () => deleteTag(tagData.id),
            onDestinationChange: (newDestinationSceneId) => {
                updateTagDestination(tagData, newDestinationSceneId);
            },
            onEditContent: () => editTagContent(tagData.id),
            destinationOptions: scenes.filter((s) => s.id !== currentScene.id),
            onSelect: () => selectTag(tagData),
        });
        fragment.appendChild(li);
    });
    tagListEl.appendChild(fragment);
};

const updateTagContent = (tagData, newContent) => {
    tagData.content = newContent;
    if (tagData.type === 'text' && tagData.element) {
        tagData.element.setAttribute('value', newContent);
    } else if ((tagData.type === 'image' || tagData.type === 'video') && tagData.element) {
        tagData.element.setAttribute('src', newContent);
    }

    saveProjectToLocalStorage();
};

const updateTagDestination = (tagData, newDestinationSceneId) => {
    tagData.destinationSceneId = newDestinationSceneId;
    if (tagData.element) {
        const labelEl = tagData.element.querySelector('a-text');
        const destinationScene = scenes.find((s) => s.id === newDestinationSceneId);
        if (labelEl) {
            labelEl.setAttribute('value', destinationScene ? destinationScene.name : 'Inconnu');
        }
    }

    saveProjectToLocalStorage();
};

const deleteTag = (tagId) => {
    openConfirmDeleteModal(
        'Supprimer le tag',
        'Êtes-vous sûr de vouloir supprimer ce tag ?',
        () => {
            const tagIndex = currentScene.tags.findIndex((t) => t.id === tagId);
            if (tagIndex !== -1) {
                const tagData = currentScene.tags[tagIndex];
                if (tagData.element && tagData.element.parentNode) {
                    tagData.element.parentNode.removeChild(tagData.element);
                }
                currentScene.tags.splice(tagIndex, 1);
                updateTagList();

                if (selectedTag && selectedTag.id === tagId) {
                    removeHighlightFromScene();
                    selectedTag = null;
                }

                saveProjectToLocalStorage();
            }
        }
    );
};

const renameTag = (tagId) => {
    const tagData = currentScene.tags.find((t) => t.id === tagId);
    if (tagData) {
        openRenameModal('Renommer le tag', tagData.name, (newName) => {
            if (newName && newName.trim() !== '') {
                tagData.name = newName.trim();
                updateTagList();

                saveProjectToLocalStorage();
            }
        });
    }
};

const editTagContent = (tagId) => {
    const tagData = currentScene.tags.find((t) => t.id === tagId);
    if (tagData && tagData.type === 'text') {
        openTextEditModal(tagData.content, (newContent) => {
            if (newContent !== null) {
                updateTagContent(tagData, newContent);

                saveProjectToLocalStorage();
            }
        });
    }
};

const capitalizeFirstLetter = (string) => {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : '';
};

export const selectTag = (tagData) => {
    if (selectedTag) {
        deselectTag();
    }
    selectedTag = tagData;
    highlightTagInScene(tagData);

    const tagListItem = document.querySelector(`[data-tag-id="${tagData.id}"]`);
    if (tagListItem) {
        tagListItem.style.backgroundColor = tagData.type === 'door' ? '#e0e0e0' : '#f0f0f0';
    }
};

const deselectTag = () => {
    if (selectedTag) {
        removeHighlightFromScene();
        const tagListItem = document.querySelector(`[data-tag-id="${selectedTag.id}"]`);
        if (tagListItem) {
            tagListItem.style.backgroundColor = '';
        }
        selectedTag = null;
    }
};

const highlightTagInScene = (tagData) => {
    removeHighlightFromScene();
    highlightEl = document.createElement('a-entity');
    highlightEl.setAttribute('geometry', {
        primitive: 'circle',
        radius: 0.8,
    });
    highlightEl.setAttribute('material', {
        color: '#FFFFFF',
        opacity: 0.5,
        side: 'double',
    });
    highlightEl.setAttribute('position', tagData.position);
    highlightEl.setAttribute('look-at', '#camera');
    highlightEl.setAttribute('class', 'tag-highlight');
    sceneEl.appendChild(highlightEl);

    const updateHighlightPosition = () => {
        if (highlightEl && tagData.element) {
            highlightEl.setAttribute('position', tagData.element.getAttribute('position'));
        }
    };
    tagData.element.addEventListener('componentchanged', (event) => {
        if (event.detail.name === 'position') {
            updateHighlightPosition();
        }
    });
};

const removeHighlightFromScene = () => {
    if (highlightEl) {
        sceneEl.removeChild(highlightEl);
        highlightEl = null;
    }
};

export const initializeTagManager = () => {
    sceneEl.addEventListener('click', (event) => {
        if (!event.target.classList.contains('tag-element') && !event.target.closest('.cat__list__item')) {
            deselectTag();
        }
    });
};