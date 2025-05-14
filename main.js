import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { STLLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js';


// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);

// Ground (alternating road and sidewalk)
const tileSize = 2;
const rows = 10;
for (let i = 0; i < rows; i++) {
  const color = i % 2 === 0 ? 0x333333 : 0x888888;
  const geometry = new THREE.PlaneGeometry(20, tileSize);
  const material = new THREE.MeshStandardMaterial({ color });
  const tile = new THREE.Mesh(geometry, material);
  tile.rotation.x = -Math.PI / 2;
  tile.position.z = -i * tileSize;
  scene.add(tile);
}

// Player (STL model)
let player;
const loader = new STLLoader();
loader.load('./assets/chicken1.stl', (geometry) => {
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  player = new THREE.Mesh(geometry, material);
  player.scale.set(0.02, 0.02, 0.02); // Adjust scale as needed
  player.rotation.x = -Math.PI / 2; // STL models often need rotation
  player.position.set(0, 0.5, 0);
  scene.add(player);
});

// Function to create a simple car shape
function createCar() {
  const car = new THREE.Group();

  const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.25;
  car.add(body);

  const roofGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x990000 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 0.65, 0);
  car.add(roof);

  return car;
}

// Cars
const cars = [];
for (let i = 1; i < rows; i += 2) {
  const car = createCar();
  car.position.set(Math.random() * 10 - 5, 0, -i * tileSize);
  car.userData.speed = (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1);
  scene.add(car);
  cars.push(car);
}

// Camera position
camera.position.set(0, 10, 10);
camera.lookAt(0, 0, 0);

// Controls
document.addEventListener('keydown', (event) => {
  if (!player) return;
  const step = tileSize;
  if (event.key === 'ArrowUp') player.position.z -= step;
  if (event.key === 'ArrowDown') player.position.z += step;
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
        alert(`🎉 You won! Record: ${seconds} seconds`);
        player.position.set(0, 0.5, 0);
        startTime = Date.now();
        gameWon = false;
      }, 100);
    }
  }

  renderer.render(scene, camera);
}

animate();
