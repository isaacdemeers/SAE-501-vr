import { exportProjectData } from './sceneManager.js';

export const saveProjectToLocalStorage = () => {
    const projectData = exportProjectData();
    localStorage.setItem('virtualTourProject', JSON.stringify(projectData));
};

export const loadProjectFromLocalStorage = () => {
    const projectDataString = localStorage.getItem('virtualTourProject');
    if (projectDataString) {
        try {
            const projectData = JSON.parse(projectDataString);
            return projectData;
        } catch (error) {
            console.error('Erreur lors de l\'analyse des données du projet à partir du stockage local :', error);
            return null;
        }
    }
    return null;
};

export const clearLocalStorage = () => {
    localStorage.removeItem('virtualTourProject');

    location.reload();
};

export const downloadProjectArchive = () => {
    const projectData = exportProjectData();
    const projectDataStr = encodeURIComponent(JSON.stringify(projectData));

    // Créer l'URL avec les données du projet
    const exportUrl = `/export-project?projectData=${projectDataStr}`;

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = 'virtual-tour-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


