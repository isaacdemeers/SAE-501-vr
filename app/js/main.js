import { loadJSON } from './utilities.js';
import { importProjectData } from './sceneManager.js';

let data = await loadJSON('../../project.json')
console.log(data)
importProjectData(data);


// document.addEventListener('DOMContentLoaded', () => {

//     setupEventListeners();
// });
