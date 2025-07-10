import * as three from './modules/three.module.js';

export function setupRoads(scene, tileSize, rows) {
    for (let i = 0; i < rows; i++) {
        // Alternate between pure white and light grey
        const color = i % 2 === 0 ? 0xffffff : 0xd3d3d3;
        const geometry = new three.PlaneGeometry(40, tileSize); // Increased width from 20 to 40
        const material = new three.MeshStandardMaterial({ color });
        const tile = new three.Mesh(geometry, material);
        tile.rotation.x = -Math.PI / 2;
        tile.position.z = -i * tileSize;
        scene.add(tile);
    }
}
