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

export const cartesianToSpherical = (cartesian) => {
    const radius = Math.sqrt(cartesian.x * cartesian.x + cartesian.y * cartesian.y + cartesian.z * cartesian.z);
    const theta = Math.atan2(cartesian.x, cartesian.z);
    const phi = Math.acos(cartesian.y / radius);
    return { radius, theta, phi };
};

export const sphericalToCartesian = (spherical) => {
    const { radius, theta, phi } = spherical;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);
    return new THREE.Vector3(x, y, z);
};
