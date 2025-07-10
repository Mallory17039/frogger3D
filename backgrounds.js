import * as three from './modules/three.module.js';

export function setupBackground(scene) {
  const loader = new three.TextureLoader();
  loader.load('./assets/background.jpg', function(texture) {
    scene.background = texture;
  });
}
