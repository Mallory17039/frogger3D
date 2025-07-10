import * as three from './modules/three.module.js';

let roadTiles = [];

export function setupRoads(scene, tileSize, rows) {
    // Remove old road tiles
    roadTiles.forEach(tile => scene.remove(tile));
    roadTiles = [];

    for (let i = 0; i < rows; i++) {
        const color = i % 2 === 0 ? 0x333333 : 0x888888;
        const geometry = new three.PlaneGeometry(28, tileSize); // Static 28 unit width
        const material = new three.MeshStandardMaterial({ color });
        const tile = new three.Mesh(geometry, material);
        tile.rotation.x = -Math.PI / 2;
        tile.position.z = -i * tileSize;
        scene.add(tile);
        roadTiles.push(tile);
    }
}