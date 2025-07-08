import * as three from './modules/three.module.js';

let trees = [];

export function spawnTrees(scene, level, rows, tileSize) {
  // Remove old trees
  trees.forEach(tree => scene.remove(tree));
  trees = [];

  // Spawn new trees on even rows (sidewalks)
  for (let i = 0; i < rows; i += 2) {
    // Skip the starting row (row 0) so player can start
    if (i === 0) continue;
    
    // Number of trees per row matches level (capped at 3)
    const treesPerRow = Math.min(level, 3);
    
    // Calculate grid positions - chicken moves in tileSize steps
    const gridPositions = [];
    for (let x = -8; x <= 8; x += tileSize) {
      gridPositions.push(x);
    }
    
    // Shuffle grid positions to get random placement on grid
    const shuffledPositions = [...gridPositions].sort(() => Math.random() - 0.5);
    
    // Place trees on available grid positions
    for (let j = 0; j < Math.min(treesPerRow, shuffledPositions.length); j++) {
      const tree = createTree();
      const xPosition = shuffledPositions[j];
      
      tree.position.set(xPosition, 0, -i * tileSize);
      scene.add(tree);
      trees.push(tree);
    }
  }
}

export function animateTrees(player, scene) {
  // Trees are static obstacles - collision handled by movement validation
  // This function is kept for consistency but trees don't need animation
}

export function isPositionBlocked(x, z) {
  // Check if a position is blocked by any tree
  return trees.some(tree => {
    const dx = Math.abs(tree.position.x - x);
    const dz = Math.abs(tree.position.z - z);
    // Check if position exactly matches tree position (grid-based)
    return dx < 0.1 && dz < 0.1;
  });
}

function createTree() {
  const tree = new three.Group();

  // Create trunk
  const trunkGeometry = new three.CylinderGeometry(0.1, 0.15, 1.5, 8);
  const trunkMaterial = new three.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
  const trunk = new three.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.75; // Half the height to sit on ground
  tree.add(trunk);

  // Create foliage (multiple spheres for a more natural look)
  const foliageColors = [0x228B22, 0x32CD32, 0x006400]; // Different shades of green
  
  // Bottom layer of foliage
  const foliage1Geometry = new three.SphereGeometry(0.8, 8, 6);
  const foliage1Material = new three.MeshStandardMaterial({ color: foliageColors[0] });
  const foliage1 = new three.Mesh(foliage1Geometry, foliage1Material);
  foliage1.position.y = 1.3;
  tree.add(foliage1);

  // Middle layer
  const foliage2Geometry = new three.SphereGeometry(0.6, 8, 6);
  const foliage2Material = new three.MeshStandardMaterial({ color: foliageColors[1] });
  const foliage2 = new three.Mesh(foliage2Geometry, foliage2Material);
  foliage2.position.y = 1.8;
  tree.add(foliage2);

  // Top layer
  const foliage3Geometry = new three.SphereGeometry(0.4, 8, 6);
  const foliage3Material = new three.MeshStandardMaterial({ color: foliageColors[2] });
  const foliage3 = new three.Mesh(foliage3Geometry, foliage3Material);
  foliage3.position.y = 2.2;
  tree.add(foliage3);

  // Add some random rotation for variety
  tree.rotation.y = Math.random() * Math.PI * 2;

  return tree;
}
