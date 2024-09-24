// Initialize scene and assets
const sceneEl = document.querySelector('a-scene');
const assetsEl = document.querySelector('#assets');
const skyEl = document.querySelector('#sky');
const cameraEl = document.querySelector('#camera');
const sceneListEl = document.getElementById('sceneList');
const destinationSceneListEl = document.getElementById('destinationSceneList');
const doorPlacementModal = document.getElementById('doorPlacementModal');
const cancelDoorPlacementButton = document.getElementById('cancelDoorPlacementButton');
const placeDoorButton = document.getElementById('placeDoorButton');

// Data structures to hold scenes and doors
let scenes = [];
let currentScene = null;

// Handle scene image upload
document.getElementById('addSceneButton').addEventListener('click', () => {
    const fileInput = document.getElementById('sceneImageUpload');
    const file = fileInput.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        addScene(url);
        fileInput.value = ''; // Reset the file input
    } else {
        alert('Please select an image to upload.');
    }
});

// Function to add a new scene
function addScene(imageSrc) {
    const sceneId = 'scene' + scenes.length;

    // Create an <img> element in <a-assets>
    const imgEl = document.createElement('img');
    imgEl.setAttribute('id', sceneId + '-image');
    imgEl.setAttribute('src', imageSrc);
    assetsEl.appendChild(imgEl);

    scenes.push({
        id: sceneId,
        image: '#' + imgEl.getAttribute('id'),  // Use asset ID
        doors: []
    });

    // Add scene to the scene list UI
    const li = document.createElement('li');
    li.textContent = 'Scene ' + (scenes.length); // Corrected scene numbering
    li.dataset.sceneId = sceneId;
    li.addEventListener('click', () => {
        switchScene(sceneId);
    });
    sceneListEl.appendChild(li);

    if (!currentScene) {
        // If this is the first scene, set it as the current scene
        switchScene(sceneId);
    }
}

// Function to switch to a scene
function switchScene(sceneId) {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
        currentScene = scene;

        // Wait for the scene image to load before updating the sky
        const imgEl = document.querySelector(scene.image);
        if (!imgEl.complete) {
            imgEl.addEventListener('load', () => {
                skyEl.setAttribute('material', 'src', scene.image);
            });
        } else {
            skyEl.setAttribute('material', 'src', scene.image);
        }

        // Remove existing doors
        const existingDoors = document.querySelectorAll('.door');
        existingDoors.forEach(door => door.parentNode.removeChild(door));

        // Add doors for the scene
        scene.doors.forEach(doorData => {
            createDoor(doorData.position, doorData.destinationSceneId);
        });
    }
}

// Variable to track if we're in door placement mode
let placingDoor = false;
let doorPosition = null;

// Event listener for the "Place Door" button
placeDoorButton.addEventListener('click', () => {
    placingDoor = true;
    alert('Click on the scene to place a door.');
});

// Handle click events on the sky to place doors
skyEl.addEventListener('click', function (event) {
    if (placingDoor) {
        const intersection = event.detail.intersection;
        if (intersection) {
            doorPosition = intersection.point;
            openDoorPlacementModal();
        } else {
            alert('Unable to determine click position.');
            placingDoor = false;
        }
    }
});

// Open the door placement modal
function openDoorPlacementModal() {
    // Populate the destination scene list
    destinationSceneListEl.innerHTML = '';
    scenes.forEach((scene, index) => {
        if (scene.id !== currentScene.id) { // Exclude the current scene
            const li = document.createElement('li');
            li.textContent = 'Scene ' + (index + 1);
            li.dataset.sceneId = scene.id;
            li.addEventListener('click', () => {
                selectDestinationScene(scene.id);
            });
            destinationSceneListEl.appendChild(li);
        }
    });
    doorPlacementModal.style.display = 'block';
}

// Handle door placement cancellation
cancelDoorPlacementButton.addEventListener('click', () => {
    placingDoor = false;
    doorPlacementModal.style.display = 'none';
    doorPosition = null;
});

// Handle destination scene selection
function selectDestinationScene(destinationSceneId) {
    // Save door data in the current scene
    currentScene.doors.push({
        position: doorPosition,
        destinationSceneId: destinationSceneId
    });
    // Create the door in the scene
    createDoor(doorPosition, destinationSceneId);
    // Reset door placement state
    placingDoor = false;
    doorPosition = null;
    doorPlacementModal.style.display = 'none';
}

// Function to create a door at a position
function createDoor(position, destinationSceneId) {
    // For testing, add a simple cube instead of a door
    const doorEl = document.createElement('a-box');
    doorEl.setAttribute('color', '#4CC3D9');
    doorEl.setAttribute('height', 1);
    doorEl.setAttribute('width', 1);
    doorEl.setAttribute('depth', 1);

    // Adjust the door's position to be in front of the sky sphere
    const cameraPosition = cameraEl.object3D.position.clone();
    const directionVector = position.clone().sub(cameraPosition).normalize();
    const doorDistance = 4; // Distance from the camera
    const doorPosition = cameraPosition.add(directionVector.multiplyScalar(doorDistance));

    doorEl.setAttribute('position', doorPosition);
    doorEl.setAttribute('class', 'door clickable');
    doorEl.setAttribute('look-at', '#camera');
    doorEl.setAttribute('door-destination', destinationSceneId);
    doorEl.addEventListener('click', onDoorClick);
    sceneEl.appendChild(doorEl);
}

// Handle door click to navigate to the destination scene
function onDoorClick(event) {
    const destinationSceneId = this.getAttribute('door-destination');
    switchScene(destinationSceneId);
}
