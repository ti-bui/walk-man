import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// LOADERS
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      child.material.envMapIntensity = global.envMapIntensity;
    }
  });
};

/**
 * Models
 */
gltfLoader.load("/models/Avocado/glTF/Avocado.gltf", (gltf) => {
  gltf.scene.scale.set(100, 100, 100);
  scene.add(gltf.scene);

  updateAllMaterials();
});

// DEBUG
const gui = new GUI();
const global = {};

// SCENE
const scene = new THREE.Scene();

/**
 * Environment Map
 */
global.envMapIntensity = 2;
gui.add(global, "envMapIntensity", 0, 10, 0.001).onChange(updateAllMaterials);

// LDR cube texture
const environmentMap = cubeTextureLoader.load([
  "/environmentMaps/2/px.png",
  "/environmentMaps/2/nx.png",
  "/environmentMaps/2/py.png",
  "/environmentMaps/2/ny.png",
  "/environmentMaps/2/pz.png",
  "/environmentMaps/2/nz.png",
]);
scene.background = environmentMap;
scene.environment = environmentMap;

scene.backgroundBlurriness = 0.2;
scene.backgroundIntensity = 3;

gui.add(scene, "backgroundBlurriness", 0, 1, 0.001);
gui.add(scene, "backgroundIntensity", 0, 10, 0.001);

// CANVAS
const canvas = document.querySelector("canvas.webgl");

// SIZES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// OBJECT
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 1,
    color: 0xaaaaaa,
  })
);
torusKnot.position.x = -4;
torusKnot.position.y = 4;

scene.add(torusKnot);

// RESIZE
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width / sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// CAMERA
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 5, 4);
scene.add(camera);

// CONTROL
const controls = new OrbitControls(camera, canvas);
controls.target.y = 3.5;
controls.enableDamping = true;

// RENDERER
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATION
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
