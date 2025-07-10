import * as three from './modules/three.module.js';
import { STLLoader } from './modules/STLLoader.patched.js';
import { spawnCars, animateCars } from './cars.js';
import { spawnBikes, animateBikes } from './bikes.js';
import { spawnTrees, animateTrees, isPositionBlocked } from './trees.js';
import { setupBackground } from './backgrounds.js';
import { setupRoads } from './roads.js';

// Level
let currentLevel = 1;
const maxLevel = 5;

// Scene setup
const scene = new three.Scene();
const camera = new three.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new three.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

// Ground (alternating road and sidewalk)
const tileSize = 2;
const rows = 16; // Increased from 10 to 16 (6 more rows)
setupRoads(scene, tileSize, rows);

// Player (STL model)
let player;
let chickenLight;
const loader = new STLLoader();
loader.load('./assets/chicken1.stl', (geometry) => {
  const material = new three.MeshStandardMaterial({ color: 0xd4af37 });
  player = new three.Mesh(geometry, material);
  player.scale.set(2, 2, 2); // Adjust scale as needed
  player.rotation.x = -Math.PI / 2; // STL models often need rotation
  player.rotation.z = 1.55;
  player.position.set(0, 0.5, 0); // Spawn at the front row of the road
  scene.add(player);

  // Create spotlight above the chicken
  chickenLight = new three.SpotLight(0xffffff); // 0xffffff is white
  chickenLight.position.set(player.position.x, player.position.y + 5, player.position.z);
  chickenLight.target = player;
  chickenLight.power = 300;
  chickenLight.penumbra = .5;
  scene.add(chickenLight)
});
loader.load('./assets/chicken1.stl', (geometry) => {
  // ... existing player setup ...
  spawnCars(scene, currentLevel, rows, tileSize); // Spawn cars for level 1
  spawnBikes(scene, currentLevel, rows, tileSize); // Placeholder for bike spawning
  spawnTrees(scene, currentLevel, rows, tileSize); // Placeholder for tree spawning
  setupBackground(scene); // Placeholder for background setup
});

// Camera position
camera.position.set(0, 12, 2); // Higher up and closer for more top-down view
camera.lookAt(0, 0, -8); // Look towards the middle of the level

// Controls
document.addEventListener('keydown', (event) => {
  if (!player) return;
  const step = tileSize;
  
  if (event.key === 'ArrowUp') {
    const newZ = player.position.z - step;
    if (!isPositionBlocked(player.position.x, newZ)) {
      player.position.z = newZ;
    }
  }
  if (event.key === 'ArrowDown') {
    const minZ = 0; // Can't go back past the starting row (front of road)
    const newZ = player.position.z + step;
    if (newZ <= minZ && !isPositionBlocked(player.position.x, newZ)) {
      player.position.z = newZ;
    }
  }
  if (event.key === 'ArrowLeft') {
    const newX = player.position.x - step;
    const minX = -12; // Static left boundary
    if (newX >= minX && !isPositionBlocked(newX, player.position.z)) {
      player.position.x = newX;
    }
  }
  if (event.key === 'ArrowRight') {
    const newX = player.position.x + step;
    const maxX = 12; // Static right boundary
    if (newX <= maxX && !isPositionBlocked(newX, player.position.z)) {
      player.position.x = newX;
    }
  }
});

// Timer and win tracking
let startTime = Date.now();
let cumulativeTime = 0; // Track total time across all levels
let gameWon = false;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (player && !gameWon) {

    if (chickenLight) {
      chickenLight.position.set(player.position.x, player.position.y + 5, player.position.z);
      chickenLight.target.position.set(player.position.x, player.position.y, player.position.z);
    }

    animateCars(player, scene, () => {
      alert("🚗 Game Over! Try again.");
      currentLevel = 1;
      cumulativeTime = 0; // Reset cumulative time on game over
      player.position.set(0, 0.5, 0); // Reset to front row of road
      spawnCars(scene, currentLevel, rows, tileSize);
      spawnBikes(scene, currentLevel, rows, tileSize);
      spawnTrees(scene, currentLevel, rows, tileSize);
      startTime = Date.now();
    });

    animateBikes(player, scene, () => {
      // Placeholder for bike collision logic
    });

    animateTrees(player, scene);

    if (player.position.z <= -((rows - 1) * tileSize)) {
      gameWon = true;
      const endTime = Date.now();
      const levelTime = (endTime - startTime) / 1000; // Time for this level
      cumulativeTime += levelTime; // Add to cumulative time
      const seconds = cumulativeTime.toFixed(2);
        setTimeout(() => {

          if (currentLevel < maxLevel) {
            const next = confirm(`🎉 You won Level ${currentLevel}!
Level time: ${levelTime.toFixed(2)} seconds
Total time: ${seconds} seconds

Go to Level ${currentLevel + 1}?`);
            if (next) {
              currentLevel++;
              player.position.set(0, 0.5, 0); // Reset to front row of road
              spawnCars(scene, currentLevel, rows, tileSize);
              spawnBikes(scene, currentLevel, rows, tileSize);
              spawnTrees(scene, currentLevel, rows, tileSize);
              startTime = Date.now(); // Reset timer for next level
            } else {
              alert("Thanks for playing!");
              currentLevel = 1;
              cumulativeTime = 0; // Reset cumulative time when restarting
              player.position.set(0, 0.5, 0); // Reset to front row of road
              spawnCars(scene, currentLevel, rows, tileSize);
              spawnBikes(scene, currentLevel, rows, tileSize);
              spawnTrees(scene, currentLevel, rows, tileSize);
              startTime = Date.now(); // Reset timer when restarting
            }
          } else {
            alert(`🏆 You completed all ${maxLevel} levels! Total time: ${seconds} seconds`);
            currentLevel = 1;
            cumulativeTime = 0; // Reset cumulative time when restarting
            player.position.set(0, 0.5, 0); // Reset to front row of road
            spawnCars(scene, currentLevel, rows, tileSize);
            spawnBikes(scene, currentLevel, rows, tileSize);
            spawnTrees(scene, currentLevel, rows, tileSize);
            startTime = Date.now(); // Reset timer when restarting
      }

  gameWon = false;
}, 100);


    }
  }

  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
