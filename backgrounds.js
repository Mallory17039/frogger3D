
import * as three from './modules/three.module.js';

let backgroundElements = [];

export function setupBackground(scene) {
  // Remove old background elements
  backgroundElements.forEach(element => scene.remove(element));
  backgroundElements = [];

  // Create grass areas on both sides of the road
  createGrassAreas(scene);
  
  // Add random trees in the background
  createBackgroundTrees(scene);
  
  // Create extended environment (no sky)
  createExtendedEnvironment(scene);
}

function createGrassAreas(scene) {
  const grassColors = [0x228B22, 0x32CD32, 0x006400, 0x9ACD32, 0x90EE90]; // Multiple grass shades
  
  // Create two separate grass areas that don't overlap with the road
  // Road is 28 units wide (±14 from center) and goes from z=0 to z=-32
  
  // Left side of road
  const leftWidth = 140;
  const leftLength = 120;
  const segments = 35;
  
  const leftGrassGeometry = new three.PlaneGeometry(leftWidth, leftLength, segments, segments);
  addUnifiedGrassVariation(leftGrassGeometry, grassColors);
  
  const leftGrassMaterial = new three.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    side: three.DoubleSide
  });
  
  const leftGrass = new three.Mesh(leftGrassGeometry, leftGrassMaterial);
  leftGrass.rotation.x = -Math.PI / 2;
  leftGrass.position.set(-84, -0.01, -10); // Left of road (road center -14, so -14-70 = -84)
  scene.add(leftGrass);
  backgroundElements.push(leftGrass);
  
  // Right side of road
  const rightGrassGeometry = new three.PlaneGeometry(leftWidth, leftLength, segments, segments);
  addUnifiedGrassVariation(rightGrassGeometry, grassColors);
  
  const rightGrassMaterial = new three.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    side: three.DoubleSide
  });
  
  const rightGrass = new three.Mesh(rightGrassGeometry, rightGrassMaterial);
  rightGrass.rotation.x = -Math.PI / 2;
  rightGrass.position.set(84, -0.01, -10); // Right of road (road center +14, so +14+70 = +84)
  scene.add(rightGrass);
  backgroundElements.push(rightGrass);
  
  // Front area (in front of road)
  const frontWidth = 200;
  const frontLength = 30;
  
  const frontGrassGeometry = new three.PlaneGeometry(frontWidth, frontLength, 50, 8);
  addUnifiedGrassVariation(frontGrassGeometry, grassColors);
  
  const frontGrassMaterial = new three.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    side: three.DoubleSide
  });
  
  const frontGrass = new three.Mesh(frontGrassGeometry, frontGrassMaterial);
  frontGrass.rotation.x = -Math.PI / 2;
  frontGrass.position.set(0, -0.01, 15); // In front of road
  scene.add(frontGrass);
  backgroundElements.push(frontGrass);
  
  // Back area (behind road)
  const backWidth = 200;
  const backLength = 40;
  
  const backGrassGeometry = new three.PlaneGeometry(backWidth, backLength, 50, 10);
  addUnifiedGrassVariation(backGrassGeometry, grassColors);
  
  const backGrassMaterial = new three.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    side: three.DoubleSide
  });
  
  const backGrass = new three.Mesh(backGrassGeometry, backGrassMaterial);
  backGrass.rotation.x = -Math.PI / 2;
  backGrass.position.set(0, -0.01, -52); // Behind road (road ends at -32, so -32-20 = -52)
  scene.add(backGrass);
  backgroundElements.push(backGrass);
}

function createBackgroundTrees(scene) {
  const numTrees = 200; // Increased significantly for denser coverage
  
  for (let i = 0; i < numTrees; i++) {
    const tree = createBackgroundTree();
    
    // Random position in background areas (left and right of road) - focus more on sides
    const side = Math.random() > 0.5 ? 1 : -1; // Choose left or right side
    const x = side * (16 + Math.random() * 80); // 16-96 units from center (extended range)
    
    // Cover the entire length of the level plus extensions
    // But avoid the front area (positive z values near the starting line)
    let z;
    const rand = Math.random();
    if (rand < 0.8) {
      // Most trees behind and alongside the level
      z = -2 - Math.random() * 60; // Behind and along the road, starting closer to front
    } else {
      // Some trees at the end behind finish line
      z = -35 - Math.random() * 25; // Far behind the level
    }
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    backgroundElements.push(tree);
  }
  
  // Add more trees specifically along the road sides
  const roadSideTrees = 60; // New category for road-side trees
  for (let i = 0; i < roadSideTrees; i++) {
    const tree = createBackgroundTree();
    
    // Position specifically along the road sides
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (15 + Math.random() * 25); // 15-40 units from center (closer to road)
    const z = -Math.random() * 35; // Along the road length
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    backgroundElements.push(tree);
  }
  
  // Add some trees behind the end of the level (but not too close to road)
  const endTrees = 40; // Increased for wider coverage
  for (let i = 0; i < endTrees; i++) {
    const tree = createBackgroundTree();
    
    // Position behind the finish line - extended wider
    const x = (Math.random() - 0.5) * 150; // Spread across much wider area behind finish
    const z = -35 - Math.random() * 20; // Behind the end of level
    
    // Only place if not too close to the road
    if (Math.abs(x) > 16) {
      tree.position.set(x, 0, z);
      scene.add(tree);
      backgroundElements.push(tree);
    }
  }
  
  // Add trees at the end of the level (past the finish line)
  const finishLineTrees = 25; // Increased
  for (let i = 0; i < finishLineTrees; i++) {
    const tree = createBackgroundTree();
    
    // Position trees across the end area
    const x = (Math.random() - 0.5) * 40; // Spread across the end grass area
    const z = -35 - Math.random() * 15; // Right at the end of the level
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    backgroundElements.push(tree);
  }
  
  // Add trees in the front areas (on the grass)
  const frontTrees = 30; // New category for front area trees
  for (let i = 0; i < frontTrees; i++) {
    const tree = createBackgroundTree();
    
    // Position in front area on the grass
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = side * (20 + Math.random() * 60); // On the left/right grass areas
    const z = 5 + Math.random() * 20; // In front of the road
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    backgroundElements.push(tree);
  }
}

function createBackgroundTree() {
  const tree = new three.Group();
  
  // Create trunk with slight variation
  const trunkHeight = 2 + Math.random() * 1;
  const trunkGeometry = new three.CylinderGeometry(0.1, 0.2, trunkHeight, 6);
  const trunkMaterial = new three.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new three.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2;
  tree.add(trunk);
  
  // Create foliage with variation
  const foliageColors = [0x228B22, 0x32CD32, 0x006400, 0x9ACD32];
  const foliageColor = foliageColors[Math.floor(Math.random() * foliageColors.length)];
  
  const foliageSize = 0.8 + Math.random() * 0.6;
  const foliageGeometry = new three.SphereGeometry(foliageSize, 8, 6);
  const foliageMaterial = new three.MeshStandardMaterial({ color: foliageColor });
  const foliage = new three.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = trunkHeight + foliageSize * 0.6;
  tree.add(foliage);
  
  // Random rotation
  tree.rotation.y = Math.random() * Math.PI * 2;
  
  // Random scale variation
  const scale = 0.8 + Math.random() * 0.4;
  tree.scale.set(scale, scale, scale);
  
  return tree;
}

// Function to add unified natural variation to grass geometry with road cutout
function addUnifiedGrassVariationWithRoadCutout(geometry, grassColors) {
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  // Road boundaries - road is 28 units wide centered at x=0, and extends from z=0 to negative z
  const roadHalfWidth = 14;
  const roadStartZ = 0; // Actual road start
  const roadEndZ = -32; // Road extends to about -32 (16 rows of 2-unit tiles)
  
  // Create consistent noise pattern for height and color variation
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    
    // Check if this vertex is in the road area (only the actual road, not front/back)
    const isInRoad = Math.abs(x) <= roadHalfWidth && z <= roadStartZ && z >= roadEndZ;
    
    if (isInRoad) {
      // Instead of making transparent, move vertices below ground level
      positions.setY(i, -2); // Move well below the road
      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
    } else {
      // Create noise-based height variation that's consistent across the surface
      const noiseScale = 0.05;
      const heightNoise = Math.sin(x * noiseScale) * Math.cos(z * noiseScale) * 0.1 +
                         Math.sin(x * noiseScale * 2.3) * Math.cos(z * noiseScale * 1.7) * 0.05;
      
      positions.setY(i, positions.getY(i) + heightNoise);
      
      // Create color variation based on position for consistency
      const colorNoise = (Math.sin(x * noiseScale * 3) + Math.cos(z * noiseScale * 2.5) + 2) / 4;
      const colorIndex = Math.floor(colorNoise * grassColors.length);
      const selectedColor = new three.Color(grassColors[colorIndex]);
      
      // Add some random variation to the selected color
      const variation = 0.1;
      selectedColor.r += (Math.random() - 0.5) * variation;
      selectedColor.g += (Math.random() - 0.5) * variation;
      selectedColor.b += (Math.random() - 0.5) * variation;
      
      colors[i * 3] = selectedColor.r;
      colors[i * 3 + 1] = selectedColor.g;
      colors[i * 3 + 2] = selectedColor.b;
    }
  }
  
  geometry.setAttribute('color', new three.BufferAttribute(colors, 3));
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Function to add unified natural variation to grass geometry with consistent coloring
function addUnifiedGrassVariation(geometry, grassColors) {
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  // Create consistent noise pattern for height and color variation
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    
    // Create noise-based height variation that's consistent across the surface
    const noiseScale = 0.05;
    const heightNoise = Math.sin(x * noiseScale) * Math.cos(z * noiseScale) * 0.1 +
                       Math.sin(x * noiseScale * 2.3) * Math.cos(z * noiseScale * 1.7) * 0.05;
    
    positions.setY(i, positions.getY(i) + heightNoise);
    
    // Create color variation based on position for consistency
    const colorNoise = (Math.sin(x * noiseScale * 3) + Math.cos(z * noiseScale * 2.5) + 2) / 4;
    const colorIndex = Math.floor(colorNoise * grassColors.length);
    const selectedColor = new three.Color(grassColors[colorIndex]);
    
    // Add some random variation to the selected color
    const variation = 0.1;
    selectedColor.r += (Math.random() - 0.5) * variation;
    selectedColor.g += (Math.random() - 0.5) * variation;
    selectedColor.b += (Math.random() - 0.5) * variation;
    
    colors[i * 3] = selectedColor.r;
    colors[i * 3 + 1] = selectedColor.g;
    colors[i * 3 + 2] = selectedColor.b;
  }
  
  geometry.setAttribute('color', new three.BufferAttribute(colors, 3));
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

// Keep the old function for distant grass patches
function addGrassVariation(geometry) {
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    // Add small random height variations to vertices
    const variation = (Math.random() - 0.5) * 0.1; // Small height variation
    positions.setY(i, positions.getY(i) + variation);
  }
  positions.needsUpdate = true;
  
  // Compute normals for proper lighting with the new geometry
  geometry.computeVertexNormals();
}

function createExtendedEnvironment(scene) {
  // Create large grass fields extending far into the distance
  const distantGrassColors = [0x228B22, 0x32CD32, 0x006400, 0x9ACD32, 0x90EE90];
  
  // Create textured distant grass material function
  function createDistantGrassMaterial() {
    const color = distantGrassColors[Math.floor(Math.random() * distantGrassColors.length)];
    return new three.MeshStandardMaterial({ 
      color: color,
      roughness: 0.9,
      metalness: 0.05
    });
  }
  
  // Create multiple large grass patches extending outward with texture
  for (let ring = 1; ring <= 4; ring++) {
    const ringRadius = 50 + (ring * 30);
    const patchSize = 40;
    const numPatches = 8 + (ring * 2);
    
    for (let i = 0; i < numPatches; i++) {
      const angle = (i / numPatches) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      
      const grassGeometry = new three.PlaneGeometry(patchSize, patchSize, 4, 4); // Added segments
      addGrassVariation(grassGeometry);
      const grassMaterial = createDistantGrassMaterial();
      const grassPatch = new three.Mesh(grassGeometry, grassMaterial);
      grassPatch.rotation.x = -Math.PI / 2;
      grassPatch.position.set(x, 0, z);
      scene.add(grassPatch);
      backgroundElements.push(grassPatch);
    }
  }
  
  // Add distant trees scattered throughout
  const distantTrees = 150;
  for (let i = 0; i < distantTrees; i++) {
    const tree = createBackgroundTree();
    
    // Place trees in a wide area around the level
    const angle = Math.random() * Math.PI * 2;
    const radius = 60 + Math.random() * 100; // 60-160 units from center
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    tree.position.set(x, 0, z);
    scene.add(tree);
    backgroundElements.push(tree);
  }
  
  // Add some variety with different sized trees in clusters
  const treeClusters = 12;
  for (let cluster = 0; cluster < treeClusters; cluster++) {
    const clusterX = (Math.random() - 0.5) * 200;
    const clusterZ = (Math.random() - 0.5) * 200;
    
    // Skip clusters too close to the road
    if (Math.abs(clusterX) < 40 && Math.abs(clusterZ) < 40) continue;
    
    const treesInCluster = 5 + Math.floor(Math.random() * 8);
    for (let t = 0; t < treesInCluster; t++) {
      const tree = createBackgroundTree();
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetZ = (Math.random() - 0.5) * 20;
      
      tree.position.set(clusterX + offsetX, 0, clusterZ + offsetZ);
      
      // Make some trees larger for variety
      if (Math.random() > 0.7) {
        const scale = 1.2 + Math.random() * 0.8;
        tree.scale.set(scale, scale, scale);
      }
      
      scene.add(tree);
      backgroundElements.push(tree);
    }
  }
}
