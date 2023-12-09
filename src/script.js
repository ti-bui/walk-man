import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// SCENE
const scene = new THREE.Scene();

// CANVAS
const canvas = document.querySelector("canvas.webgl");

// DEBUG
const gui = new GUI();
const global = {};

// LOADERS
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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

let mixer = null;
gltfLoader.load("/models/CesiumMan/glTF/CesiumMan.gltf", (gltf) => {
  gltf.scene.scale.set(3, 3, 3);
  scene.add(gltf.scene);
  console.log(gltf);
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();

  updateAllMaterials();
});

// gltfLoader.load("/models/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf", (gltf) => {
//   gltf.scene.scale.set(2, 2, 2);
//   gltf.scene.position.x = -5;
//   scene.add(gltf.scene);

//   updateAllMaterials();
// });

/**
 * Environment Map
 */
global.envMapIntensity = 3;
gui.add(global, "envMapIntensity", 0, 10, 0.001).onChange(updateAllMaterials);

// LDR cube texture
// const environmentMap = cubeTextureLoader.load([
//   "/environmentMaps/2/px.png",
//   "/environmentMaps/2/nx.png",
//   "/environmentMaps/2/py.png",
//   "/environmentMaps/2/ny.png",
//   "/environmentMaps/2/pz.png",
//   "/environmentMaps/2/nz.png",
// ]);
// scene.background = environmentMap;
// scene.environment = environmentMap;

// scene.backgroundBlurriness = 0;
// scene.backgroundIntensity = 3;

// gui.add(scene, "backgroundBlurriness", 0, 1, 0.001);
// gui.add(scene, "backgroundIntensity", 0, 10, 0.001);

// HDR (RGBE) equirectangular

// SIZES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// // OBJECT
const material = new THREE.MeshStandardMaterial();
material.side = THREE.DoubleSide;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
// plane.position
scene.add(plane);

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
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  controls.update();

  if (mixer) {
    mixer.update(deltaTime);
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
