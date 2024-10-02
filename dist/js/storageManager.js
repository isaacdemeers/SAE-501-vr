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


