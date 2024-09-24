// Sélectionner la caméra
const camera = document.querySelector("#camera");

let vx = 0
let vz = 0
let vy = 0
let r = 5
let rotation = camera.getAttribute("rotation");
let selectedId = null;

let updateCube = function () {
    vx = r * Math.sin(rotation.y * Math.PI / -180)
    vz = r * -Math.cos(rotation.y * Math.PI / -180)
    vy = r * Math.sin(rotation.x * Math.PI / 180) + 2
    document.querySelector('a-box').setAttribute('position', `${vx} ${vy} ${vz}`);
    document.querySelector('a-box').setAttribute('rotation', `0 ${rotation.y} ${rotation.z}`);
}

document.addEventListener("mousemove", (e) => {
    rotation = camera.getAttribute("rotation");
    updateCube();

});


document.addEventListener("keydown", (e) => {

    if (e.code === "KeyI") {

    }

    if (e.code === "KeyO") {

    }

    if (e.code === "KeyP") {

    }
});






AFRAME.registerComponent('collider-check', {
    dependencies: ['raycaster'],

    init: function () {

        this.el.addEventListener('click', function () {
            //
            console.log('click')
            console.log(this)
        });
    }
});





let cubes = {}

// appuis sur espace pour créer un cube
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {

        // create a new box
        let id = `box${document.querySelectorAll('a-box').length}`
        const newBox = document.createElement('a-box');
        newBox.setAttribute('position', `${vx} ${vy} ${vz}`);
        newBox.setAttribute('rotation', `0 ${rotation.y} ${rotation.z}`);
        newBox.setAttribute('color', '#4CC3D9');
        newBox.setAttribute('class', 'collidable');
        newBox.setAttribute('id', id);
        document.querySelector('a-scene').appendChild(newBox);
        console.log('click')
        cubes[id] = newBox
        console.log(cubes)

    }

    // touche R pour supprimer le dernier cube
    if (e.code === "KeyR") {
        let lastBox = document.querySelectorAll('a-box')[document.querySelectorAll('a-box').length - 1]
        lastBox.setAttribute('position', `${vx} ${vy} ${vz}`);
        lastBox.setAttribute('color', '#4CC3FF');

        cubes[lastBox.id] = lastBox
        cubes
        lastBox.remove();
        console.log

    }
});

let toggleRaycaster = function () {
    document.querySelectorAll('.hand').forEach(item => {
        item.setAttribute('raycaster', { showLine: true });
    });
}

// Événement pour détecter les intersections
camera.addEventListener('raycaster-intersected', function (e) {
    const intersected = e.detail.intersections;
    if (intersected.length > 0) {
        const clickedBox = intersected[0].object.el; // L'objet A-Frame intersecté
        clickedBox.remove(); // Supprime la boîte
        console.log('Boîte supprimée');
    }
});

document.addEventListener("wheel", (e) => {
    if (e.deltaY > 0) {
        if (r > 1.3) {
            r -= 0.1;

        }

    } else {
        r += 0.1;

    }

    console.log(r);
    updateCube();
});