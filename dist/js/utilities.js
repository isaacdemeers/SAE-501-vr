// Utility function to generate unique IDs
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
