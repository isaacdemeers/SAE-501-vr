let idCounters = {
    scene: 0,
    tag: 0,
};

export const generateEntityId = (prefix) => {
    idCounters[prefix] = (idCounters[prefix] || 0) + 1;
    return `${prefix}-${idCounters[prefix]}`;
};

export const resetIdCounters = (newIdCounters) => {
    idCounters = newIdCounters;
};

export const getIdCounters = () => {
    return { ...idCounters };
};

export const vector3ToObject = (vector) => {
    return { x: vector.x, y: vector.y, z: vector.z };
};

AFRAME.registerComponent('look-at', {
    schema: { type: 'selector' },
    init: function () {
        this.targetEl = this.data;
    },
    tick: function () {
        if (!this.targetEl) return;
        this.el.object3D.lookAt(this.targetEl.object3D.position);
    },
});

export async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Unable to load JSON file at ${url}:`, error);
        throw error;
    }
}
