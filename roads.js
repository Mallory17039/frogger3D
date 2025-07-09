
import * as three from './modules/three.module.js';

export function setupRoads(scene, tileSize, rows) {
  for (let i = 0; i < rows; i++) {
    const color = i % 2 === 0 ? 0x333333 : 0x888888;
    const geometry = new three.PlaneGeometry(20, tileSize);
    const material = new three.MeshStandardMaterial({ color });
    const tile = new three.Mesh(geometry, material);
    tile.rotation.x = -Math.PI / 2;
    tile.position.z = -i * tileSize;
    scene.add(tile);
  }
}
