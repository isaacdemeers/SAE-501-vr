const resizer = document.querySelector('.resizer');
const sidebar = document.querySelector('.sidebar');
const toggleButton = document.getElementById('toggle-button');
const toggleButtonHidden = document.getElementById('toggle-button-hidden');

let isResizing = false;
let lastDownX = 0;
let sidebarWidth = sidebar.offsetWidth; // Store initial sidebar width

resizer.addEventListener('mousedown', function (e) {
    isResizing = true;
    lastDownX = e.clientX;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', function (e) {
    if (!isResizing) return;

    let offset = e.clientX - lastDownX;
    let newWidth = sidebarWidth + offset;

    // Enforce minimum width (w-8 is 2rem or 32px)
    const minWidth = 300; // pixels

    if (newWidth < minWidth) {
        newWidth = minWidth;
    }

    sidebar.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', function () {
    if (isResizing) {
        isResizing = false;
        sidebarWidth = sidebar.offsetWidth; // Update stored width
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});

function hideSidebar() {
    // Move sidebar off-screen using transform
    sidebar.classList.add('hidden-sidebar');
    toggleButtonHidden.classList.remove('hidden');
}

function showSidebar() {
    // Bring sidebar back into view
    sidebar.classList.remove('hidden-sidebar');
    toggleButtonHidden.classList.add('hidden');
}

toggleButton.addEventListener('click', function () {
    hideSidebar();
});

toggleButtonHidden.addEventListener('click', function () {
    showSidebar();
});