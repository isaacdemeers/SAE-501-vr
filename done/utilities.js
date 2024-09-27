// utilities.js

// Utility function to generate unique IDs
let idCounters = {
    scene: 0,
    door: 0,
    text: 0,
};

export const generateEntityId = (prefix) => {
    idCounters[prefix] = (idCounters[prefix] || 0) + 1;
    return `${prefix}-${idCounters[prefix]}`;
};

export const vector3ToObject = (vector) => {
    return { x: vector.x, y: vector.y, z: vector.z };
};

// Add the look-at component
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
