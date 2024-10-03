const resizableDiv = document.getElementById("resizableDiv");
const resizer = document.getElementById("resizer");

let originalWidth = 0;
let originalMouseX = 0;

let sidebarToggle = true;

resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();

    originalWidth = resizableDiv.offsetWidth;
    originalMouseX = e.clientX;

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