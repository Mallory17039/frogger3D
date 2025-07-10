
import * as three from './modules/three.module.js';

let cars = [];

export function spawnCars(scene, level, rows, tileSize) {
  // Remove old cars
  cars.forEach(car => scene.remove(car));
  cars = [];

  // Spawn new cars
  for (let i = 1; i < rows; i += 2) {
    const car = createCar();
    car.position.set(Math.random() * 24 - 12, 0, -i * tileSize); // Static spawn range -12 to +12
    const baseSpeed = Math.random() * 0.1 + 0.05;
    car.userData.speed = baseSpeed * (1 + (level - 1) * 0.5) * (Math.random() > 0.5 ? 1 : -1);
    scene.add(car);
    cars.push(car);
  }
}

export function animateCars(player, scene, onCollision) {
  cars.forEach(car => {
    car.position.x += car.userData.speed;
    // Static boundaries for car wraparound
    if (car.position.x > 15) car.position.x = -15;
    if (car.position.x < -15) car.position.x = 15;

    const dx = car.position.x - player.position.x;
    const dz = car.position.z - player.position.z;
    if (Math.abs(dx) < 1.5 && Math.abs(dz) < 1) {
      onCollision();
    }
  });
}

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
