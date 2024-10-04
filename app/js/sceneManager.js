import { generateEntityId, resetIdCounters } from './utilities.js';
import { createTag } from './tagManager.js';

export let scenes = [];
export let currentScene = null;
let skyEl = document.querySelector('#sky');
const sceneEl = document.querySelector('a-scene');
const THREE = AFRAME.THREE;

const addScene = (mediaSrc, mediaName, sceneDataInput) => {
    const sceneId = sceneDataInput?.id || generateEntityId('scene');

    mediaSrc = sceneDataInput?.mediaSrc || mediaSrc;

    const isVideo = /\.(mp4|webm|ogg)$/.test(mediaSrc.toLowerCase());

    let mediaEl = document.querySelector(`#${CSS.escape(sceneId)}-media`);
    if (!mediaEl) {
        const assetsEl = document.querySelector('a-assets');
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
        tags: sceneDataInput?.tags || [],
    };

    scenes.push(sceneData);

    if (!currentScene || sceneDataInput) {
        switchScene(sceneId);
    }
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

        // Remove existing tags
        document.querySelectorAll('.tag-element').forEach((el) => {
            el.parentNode.removeChild(el);
        });

        // Create tags for the current scene
        scene.tags.forEach((tagData) => createTag(tagData));
    }
};

export const importProjectData = (projectData) => {
    scenes = [];
    currentScene = null;

    resetIdCounters(projectData.idCounters || { scene: 0, tag: 0 });

    projectData.scenes.forEach((sceneData) => {
        const mediaSrc = sceneData.mediaSrc;
        addScene(mediaSrc, sceneData.name, { ...sceneData, tags: [] });
    });

    projectData.scenes.forEach((sceneData) => {
        const existingScene = scenes.find((s) => s.id === sceneData.id);
        if (existingScene) {
            sceneData.tags.forEach((tagDataInput) => {
                // Convert position array to THREE.Vector3
                const position = new THREE.Vector3(...tagDataInput.position);
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
};
