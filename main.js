import * as three from './modules/three.module.js';
import { STLLoader } from './modules/STLLoader.patched.js';
import { spawnCars, animateCars } from './cars.js';
import { spawnBikes, animateBikes } from './bikes.js';
import { spawnTrees, animateTrees } from './trees.js';
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
const rows = 10;
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
  player.position.set(0, 0.5, 0);
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
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// Controls
document.addEventListener('keydown', (event) => {
  if (!player) return;
  const step = tileSize;
  if (event.key === 'ArrowUp') player.position.z -= step;
  if (event.key === 'ArrowDown') {
    const minZ = 0;
    if (player.position.z + step > minZ) return;
    player.position.z += step;
  }
  if (event.key === 'ArrowLeft') player.position.x -= step;
  if (event.key === 'ArrowRight') player.position.x += step;
});

// Timer and win tracking
let startTime = Date.now();
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
      player.position.set(0, 0.5, 0);
      startTime = Date.now();
    });

    animateBikes(player, scene, () => {
      // Placeholder for bike collision logic
    });

    animateTrees(player, scene, () => {
      // Placeholder for tree collision logic
    });

    if (player.position.z <= -((rows - 1) * tileSize)) {
      gameWon = true;
      const endTime = Date.now();
      const seconds = ((endTime - startTime) / 1000).toFixed(2);
        setTimeout(() => {
          const endTime = Date.now();
          const seconds = ((endTime - startTime) / 1000).toFixed(2);

          if (currentLevel < maxLevel) {
            const next = confirm(`🎉 You won Level ${currentLevel}! Time: ${seconds} seconds

Go to Level ${currentLevel + 1}?`);
            if (next) {
              currentLevel++;
              player.position.set(0, 0.5, 0);
              spawnCars(scene, currentLevel, rows, tileSize);
              spawnBikes(scene, currentLevel, rows, tileSize);
              spawnTrees(scene, currentLevel, rows, tileSize);
            } else {
              alert("Thanks for playing!");
              currentLevel = 1;
              player.position.set(0, 0.5, 0);
              spawnCars(scene, currentLevel, rows, tileSize);
              spawnBikes(scene, currentLevel, rows, tileSize);
              spawnTrees(scene, currentLevel, rows, tileSize);
            }
          } else {
            alert(`🏆 You completed all ${maxLevel} levels! Final time: ${seconds} seconds`);
            currentLevel = 1;
            player.position.set(0, 0.5, 0);
            spawnCars(scene, currentLevel, rows, tileSize);
            spawnBikes(scene, currentLevel, rows, tileSize);
            spawnTrees(scene, currentLevel, rows, tileSize);
      }

  startTime = Date.now();
  gameWon = false;
}, 100);


    }
  }

  renderer.render(scene, camera);
}

animate();
