// Sélectionner la div et le resizer
const resizableDiv = document.getElementById("resizableDiv");
const resizer = document.getElementById("resizer");

// Variables pour garder une trace de la largeur initiale et de la position de la souris
let originalWidth = 0;
let originalMouseX = 0;

let sidebarToggle = true;

// Commencer à redimensionner
resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();

    // Stocker les dimensions actuelles de la div et la position de la souris
    originalWidth = resizableDiv.offsetWidth;
    originalMouseX = e.clientX;

    // Écouter les mouvements de la souris
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
});

function resize(e) {
    const newWidth = originalWidth + (e.clientX - originalMouseX);

    if (newWidth >= 265 && newWidth <= 400) {
        resizableDiv.style.width = newWidth + 'px';
    }
}

function stopResize() {
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
}

document.querySelectorAll('.toggleSideBar').forEach((button) => {

    button.addEventListener('click', () => {
        if (sidebarToggle) {
            document.querySelector('.nav').style.display = 'none';
            sidebarToggle = false;
            document.querySelector('#toggleSideBar').style.display = 'flex';

        } else {
            document.querySelector('.nav').style.display = 'block';
            sidebarToggle = true;
            document.querySelector('#toggleSideBar').style.display = 'none';
        }
    });
});