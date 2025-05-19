import * as three from './modules/three.module.js';
import { STLLoader } from './modules/STLLoader.patched.js';

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
for (let i = 0; i < rows; i++) {
  const color = i % 2 === 0 ? 0x333333 : 0x888888;
  const geometry = new three.PlaneGeometry(20, tileSize);
  const material = new three.MeshStandardMaterial({ color });
  const tile = new three.Mesh(geometry, material);
  tile.rotation.x = -Math.PI / 2;
  tile.position.z = -i * tileSize;
  scene.add(tile);
}


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
  chickenLight = new three.SpotLight(0xffff00);
  chickenLight.position.set(player.position.x, player.position.y + 5, player.position.z);
  chickenLight.target = player;
  chickenLight.power = 300;
  chickenLight.penumbra = .5;
  scene.add(chickenLight)
});
loader.load('./assets/chicken1.stl', (geometry) => {
  // ... existing player setup ...
  spawnCars(currentLevel); // Spawn cars for level 1
});

// Function to create a simple car shape
function createCar() {
  const car = new three.Group();

  const bodyGeometry = new three.BoxGeometry(2, 0.5, 1);
  const bodyMaterial = new three.MeshStandardMaterial({ color: 0xff0000 });
  const body = new three.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.25;
  car.add(body);

  const roofGeometry = new three.BoxGeometry(1, 0.4, 0.8);
  const roofMaterial = new three.MeshStandardMaterial({ color: 0x990000 });
  const roof = new three.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 0.65, 0);
  car.add(roof);

  return car;
}

// Cars
const cars = [];
function spawnCars(level) {
  cars.forEach(car => scene.remove(car)); // Remove old cars
  cars.length = 0;

  for (let i = 1; i < rows; i += 2) {
    const car = createCar();
    car.position.set(Math.random() * 10 - 5, 0, -i * tileSize);
    const baseSpeed = Math.random() * 0.1 + 0.05;
    car.userData.speed = baseSpeed * (1 + (level - 1) * 0.5) * (Math.random() > 0.5 ? 1 : -1);
    scene.add(car);
    cars.push(car);
  }
}


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

    cars.forEach(car => {
      car.position.x += car.userData.speed;
      if (car.position.x > 10) car.position.x = -10;
      if (car.position.x < -10) car.position.x = 10;

      const dx = car.position.x - player.position.x;
      const dz = car.position.z - player.position.z;
      if (Math.abs(dx) < 1.5 && Math.abs(dz) < 1) {
        alert("🚗 Game Over! Try again.");
        player.position.set(0, 0.5, 0);
        startTime = Date.now();
      }
    });

    if (player.position.z <= -((rows - 1) * tileSize)) {
      gameWon = true;
      const endTime = Date.now();
      const seconds = ((endTime - startTime) / 1000).toFixed(2);
        setTimeout(() => {
          const endTime = Date.now();
          const seconds = ((endTime - startTime) / 1000).toFixed(2);

          if (currentLevel < maxLevel) {
            const next = confirm(`🎉 You won Level ${currentLevel}! Time: ${seconds} seconds\n\nGo to Level ${currentLevel + 1}?`);
            if (next) {
              currentLevel++;
              player.position.set(0, 0.5, 0);
              spawnCars(currentLevel);
            } else {
              alert("Thanks for playing!");
              currentLevel = 1;
              player.position.set(0, 0.5, 0);
              spawnCars(currentLevel);
            }
          } else {
            alert(`🏆 You completed all ${maxLevel} levels! Final time: ${seconds} seconds`);
            currentLevel = 1;
            player.position.set(0, 0.5, 0);
            spawnCars(currentLevel);
      }

  startTime = Date.now();
  gameWon = false;
}, 100);


    }
  }

  renderer.render(scene, camera);
}

animate();
