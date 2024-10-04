import { currentScene, scenes, switchScene } from './sceneManager.js';
import { vector3ToObject } from './utilities.js';

const sceneEl = document.querySelector('a-scene');
const cameraEl = document.querySelector('#camera');
const THREE = AFRAME.THREE;

export const createTag = (tagData) => {
    if (tagData.type === 'door') {
        createContentElement(tagData);
        tagData.contentVisible = true;
    } else {
        createPlaceholder(tagData);
        tagData.contentVisible = false;
    }
};

const createPlaceholder = (tagData) => {
    const placeholderEl = document.createElement('a-entity');
    placeholderEl.setAttribute('look-at', '#camera');
    placeholderEl.setAttribute('position', vector3ToObject(tagData.position));

    const childEl = document.createElement('a-entity');
    if (tagData.type === 'text') {
        childEl.setAttribute('gltf-model', './app/models/info.glb');
        childEl.setAttribute('scale', '3, 3, 3');
        childEl.setAttribute('rotation', '0 0 0');
    } else if (tagData.type === 'image') {
        childEl.setAttribute('gltf-model', './app/models/picture.glb');
        childEl.setAttribute('scale', '0.12 0.12 0.12');
        childEl.setAttribute('rotation', '0 0 0');
    }
    childEl.setAttribute('class', 'tag-element clickable');
    childEl.setAttribute('tag-id', tagData.id);

    placeholderEl.appendChild(childEl);

    let clickTimeout;
    placeholderEl.addEventListener('click', (event) => {
        // if (clickTimeout) {
            // clearTimeout(clickTimeout);
            // clickTimeout = null;
        onTagDoubleClick(tagData);
        // } else {
            // clickTimeout = setTimeout(() => {
               // clickTimeout = null;
            // }, 300);
        //}
    });

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
        contentEl.setAttribute('width', 4);
        contentEl.setAttribute('wrap-count', 30);
    } else if (tagData.type === 'door') {
        contentEl = document.createElement('a-entity');
        contentEl.setAttribute('gltf-model', './app/models/door.glb');
        contentEl.setAttribute('scale', '1 1 1');
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

        // const destinationScene = scenes.find((s) => s.id === tagData.destinationSceneId);
        // const labelEl = document.createElement('a-text');
        // labelEl.setAttribute('value', destinationScene ? destinationScene.name : 'Unknown');
        // labelEl.setAttribute('align', 'center');
        // labelEl.setAttribute('color', '#FFFFFF');
        // labelEl.setAttribute('width', 4);
        // labelEl.setAttribute('position', { x: 0, y: 2.5, z: 0 });
        // labelEl.setAttribute('look-at', '#camera');
        // contentEl.appendChild(labelEl);
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
    }

    contentEl.setAttribute('position', vector3ToObject(tagData.position));
    contentEl.setAttribute('class', 'tag-element clickable');
    contentEl.setAttribute('look-at', '#camera');

    // let clickTimeout;
    contentEl.addEventListener('click', (event) => {
        // if (clickTimeout) {
        //     clearTimeout(clickTimeout);
        //     clickTimeout = null;
        //     onTagDoubleClick(tagData);
        // } else {
        //     clickTimeout = setTimeout(() => {
        //         clickTimeout = null;
        //     }, 300);
        // }

        onTagDoubleClick(tagData);
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
};
