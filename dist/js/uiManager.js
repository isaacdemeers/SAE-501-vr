import {
    addScenesFromAssets,
    switchScene,
    updateSceneSelect,
    openSceneManagementModal,
    exportProjectData,
    importProjectData,
} from './sceneManager.js';
import {
    startPlacingDoor,
    handleSkyClickForDoor,
    cancelPlacingDoor,
} from './doorManager.js';
import {
    startPlacingText,
    handleSkyClickForText,
    confirmTextPlacement,
    cancelPlacingText,
} from './textManager.js';

export let assetsEl;
export let skyEl;
export let sceneEl;
export let cameraEl;

let renameCallback = null;
let deleteCallback = null;

let imageDeleteCallback = null;

let selectedImages = [];

export const initializeUI = () => {
    assetsEl = document.querySelector('#assets');
    skyEl = document.querySelector('#sky');
    sceneEl = document.querySelector('a-scene');
    cameraEl = document.querySelector('#camera');
};

export const showNotification = (message, type = 'info') => {
    const notificationEl = document.getElementById('notification');
    notificationEl.textContent = message;
    notificationEl.style.display = message ? 'block' : 'none';
    notificationEl.style.backgroundColor =
        type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007BFF';

    if (message) {
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    }
};

export const setupEventListeners = () => {
    document.getElementById('addScenesButton').addEventListener('click', () => {
        openImageSelectionModal();
    });

    document
        .getElementById('confirmImageSelectionButton')
        .addEventListener('click', () => {
            addScenesFromAssets(selectedImages);
            selectedImages = [];
            document.getElementById('imageSelectionModal').style.display = 'none';
        });

    document
        .getElementById('cancelImageSelectionButton')
        .addEventListener('click', () => {
            selectedImages = [];
            document.getElementById('imageSelectionModal').style.display = 'none';
        });

    document.getElementById('openUploadImagesModalButton').addEventListener('click', () => {
        document.getElementById('imageUploadInput').value = '';
        document.getElementById('uploadImagesModal').style.display = 'block';
    });

    document.getElementById('uploadImagesButton').addEventListener('click', () => {
        const files = document.getElementById('imageUploadInput').files;
        if (files.length === 0) {
            showNotification('No files selected.', 'error');
            return;
        }
        uploadImages(files);
    });

    document.getElementById('cancelUploadImagesButton').addEventListener('click', () => {
        document.getElementById('uploadImagesModal').style.display = 'none';
    });

    document.getElementById('placeDoorButton').addEventListener('click', () => {
        startPlacingDoor();
    });

    document.getElementById('addTextButton').addEventListener('click', () => {
        startPlacingText();
    });

    skyEl.addEventListener('click', (event) => {
        handleSkyClickForDoor(event);
        handleSkyClickForText(event);
    });

    document
        .getElementById('cancelDoorPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingDoor();
            document.getElementById('doorPlacementModal').style.display = 'none';
        });

    document
        .getElementById('confirmTextPlacementButton')
        .addEventListener('click', () => {
            confirmTextPlacement();
        });

    document
        .getElementById('cancelTextPlacementButton')
        .addEventListener('click', () => {
            cancelPlacingText();
            document.getElementById('textPlacementModal').style.display = 'none';
        });

    const sceneSelect = document.getElementById('sceneSelect');
    sceneSelect.addEventListener('change', () => {
        const selectedSceneId = sceneSelect.value;
        switchScene(selectedSceneId);
    });

    document
        .getElementById('manageScenesButton')
        .addEventListener('click', () => {
            openSceneManagementModal();
        });

    document
        .getElementById('closeSceneManagementButton')
        .addEventListener('click', () => {
            document.getElementById('sceneManagementModal').style.display = 'none';
        });

    document
        .getElementById('exportProjectButton')
        .addEventListener('click', () => {
            const projectData = exportProjectData();
            downloadJSON(projectData, 'project.json');
        });

    document
        .getElementById('importProjectButton')
        .addEventListener('click', () => {
            document.getElementById('importProjectInput').click();
        });

    document
        .getElementById('importProjectInput')
        .addEventListener('change', handleProjectImport);

    document.getElementById('confirmRenameButton').addEventListener('click', () => {
        if (renameCallback) {
            const newName = document.getElementById('renameInput').value.trim();
            renameCallback(newName);
            renameCallback = null;
            document.getElementById('renameModal').style.display = 'none';
        }
    });

    document.getElementById('cancelRenameButton').addEventListener('click', () => {
        renameCallback = null;
        document.getElementById('renameModal').style.display = 'none';
    });

    document.getElementById('confirmDeleteButton').addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
            document.getElementById('confirmDeleteModal').style.display = 'none';
        }
    });

    document.getElementById('cancelDeleteButton').addEventListener('click', () => {
        deleteCallback = null;
        document.getElementById('confirmDeleteModal').style.display = 'none';
    });

    document
        .getElementById('confirmImageDeleteButton')
        .addEventListener('click', () => {
            if (imageDeleteCallback) {
                imageDeleteCallback();
                imageDeleteCallback = null;
                document.getElementById('confirmImageDeleteModal').style.display = 'none';
            }
        });

    document
        .getElementById('cancelImageDeleteButton')
        .addEventListener('click', () => {
            imageDeleteCallback = null;
            document.getElementById('confirmImageDeleteModal').style.display = 'none';
        });
};

const openImageSelectionModal = () => {
    fetch('/imagelist')
        .then((response) => response.json())
        .then((imageList) => {
            const imageGrid = document.getElementById('imageGrid');
            imageGrid.innerHTML = '';
            selectedImages = [];

            imageList.forEach((imageName) => {
                const imageItem = document.createElement('div');
                imageItem.classList.add('image-item');

                const imgEl = document.createElement('img');
                imgEl.src = `assets/${encodeURIComponent(imageName)}`;
                imgEl.alt = imageName;

                const deleteIcon = document.createElement('span');
                deleteIcon.classList.add('delete-icon');
                deleteIcon.innerHTML = '&times;';
                deleteIcon.title = 'Delete Image';

                deleteIcon.addEventListener('click', (event) => {
                    event.stopPropagation();
                    openConfirmImageDeleteModal(imageName, imageItem);
                });

                imageItem.appendChild(deleteIcon);
                imageItem.appendChild(imgEl);
                imageGrid.appendChild(imageItem);

                imageItem.addEventListener('click', () => {
                    if (selectedImages.includes(imageName)) {
                        selectedImages = selectedImages.filter((name) => name !== imageName);
                        imageItem.classList.remove('selected');
                    } else {
                        selectedImages.push(imageName);
                        imageItem.classList.add('selected');
                    }
                });
            });

            document.getElementById('imageSelectionModal').style.display = 'block';
        })
        .catch((error) => {
            console.error('Error fetching image list:', error);
            showNotification('Failed to load images.', 'error');
        });
};

const uploadImages = (files) => {
    const formData = new FormData();
    for (const file of files) {
        formData.append('images', file);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Images uploaded successfully.', 'success');
                document.getElementById('uploadImagesModal').style.display = 'none';
                openImageSelectionModal();
            }
        })
        .catch((error) => {
            console.error('Error uploading images:', error);
            showNotification('Failed to upload images.', 'error');
        });
};

const openConfirmImageDeleteModal = (imageName, imageItem) => {
    document.getElementById('confirmImageDeleteMessage').textContent = `Are you sure you want to delete the image "${imageName}"?`;
    imageDeleteCallback = () => {
        deleteImage(imageName, imageItem);
    };
    document.getElementById('confirmImageDeleteModal').style.display = 'block';
};

const deleteImage = (imageName, imageItem) => {
    fetch(`/deleteimage`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageName }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Image deleted successfully.', 'success');
                imageItem.remove();

                selectedImages = selectedImages.filter((name) => name !== imageName);
            }
        })
        .catch((error) => {
            console.error('Error deleting image:', error);
            showNotification('Failed to delete image.', 'error');
        });
};

const downloadJSON = (data, filename) => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
};

const handleProjectImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
        showNotification('No file selected.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projectData = JSON.parse(e.target.result);
            importProjectData(projectData);
            showNotification('Project imported successfully.', 'success');
        } catch (err) {
            console.error('Error parsing project file:', err);
            showNotification('Failed to import project.', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
};

export const createListItem = (data, type, actions) => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    const text = document.createElement('p');

    text.textContent = data.name;

    li.classList.add('cat__list__item');
    content.classList.add('cat__list__item__content');
    content.appendChild(text);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('cat__list__item__content__buttons');

    if (actions.onRename) {
        const renameBtn = document.createElement('button');
        renameBtn.classList.add('button', 'button--square');
        const renameIcon = document.createElement('img');
        renameIcon.src = './assets/icons/photo-edit.svg';
        renameIcon.alt = 'rename button';
        renameIcon.classList.add('button__icon', 'button__icon--small');
        renameBtn.addEventListener('click', () => {
            actions.onRename();
        });
        renameBtn.appendChild(renameIcon);
        buttonsDiv.appendChild(renameBtn);
    }

    if (actions.onDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('button', 'button--square');
        const deleteIcon = document.createElement('img');
        deleteIcon.src = './assets/icons/trash.svg';
        deleteIcon.alt = 'manage scene button';
        deleteIcon.classList.add('button__icon', 'button__icon--small');
        deleteBtn.addEventListener('click', () => {
            actions.onDelete();
        });
        deleteBtn.appendChild(deleteIcon);

        buttonsDiv.appendChild(deleteBtn);
    }

    li.appendChild(buttonsDiv);


    if (type === 'door' && actions.destinationOptions) {
        const destinationSelect = document.createElement('select');
        actions.destinationOptions.forEach((scene) => {
            const option = document.createElement('option');
            option.value = scene.id;
            option.textContent = scene.name;
            if (scene.id === data.destinationSceneId) {
                option.selected = true;
            }
            destinationSelect.appendChild(option);
        });
        destinationSelect.addEventListener('change', () => {
            const newDestinationSceneId = destinationSelect.value;
            actions.onDestinationChange(newDestinationSceneId);
        });
        li.appendChild(destinationSelect);
    }

    if (type === 'text' && actions.onContentChange) {
        const editContentBtn = document.createElement('button');
        editContentBtn.textContent = 'Edit Text';
        editContentBtn.addEventListener('click', () => {
            const newContent = prompt('Enter new text content:', data.content);
            if (newContent !== null && newContent.trim() !== '') {
                actions.onContentChange(newContent.trim());
            }
        });
        li.appendChild(editContentBtn);
    }

    return li;
};

export const openRenameModal = (title, currentName, callback) => {
    document.getElementById('renameModalTitle').textContent = title;
    document.getElementById('renameInput').value = currentName;
    renameCallback = callback;
    document.getElementById('renameModal').style.display = 'block';
};

export const openConfirmDeleteModal = (title, message, callback) => {
    document.getElementById('confirmDeleteModalTitle').textContent = title;
    document.getElementById('confirmDeleteMessage').textContent = message;
    deleteCallback = callback;
    document.getElementById('confirmDeleteModal').style.display = 'block';
};
