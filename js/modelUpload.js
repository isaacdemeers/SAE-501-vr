document.addEventListener('click', function () {
    document.querySelector('a-sky').setAttribute('src', './assets/GS3.jpg');
});


// Sélectionner les éléments du DOM
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');

// Écouter les changements sur l'input de fichier
fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0]; // Récupérer le fichier sélectionné

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result; // Afficher l'image
            imagePreview.style.display = 'block'; // Afficher l'élément img
            console.log(e.target.result);
        };

        reader.readAsDataURL(file); // Lire le fichier et générer une URL
    } else {
        imagePreview.style.display = 'none'; // Masquer l'aperçu si aucun fichier n'est sélectionné
    }
});
