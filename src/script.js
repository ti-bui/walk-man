import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

THREE.ColorManagement.enabled = false;

// SCENE
const scene = new THREE.Scene();

// CANVAS
const canvas = document.querySelector("canvas.webgl");

// LOADERS
const gltfLoader = new GLTFLoader();

// LIGHTS
const pointLight = new THREE.PointLight(0xff9000, 12.5);
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

const yellowSpotLight = new THREE.SpotLight(
  "orange",
  4.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
yellowSpotLight.position.set(0, 1.5, 3.5);
yellowSpotLight.intensity = 10;
scene.add(yellowSpotLight);

const blueSpotLight = new THREE.SpotLight(
  "blue",
  4.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
blueSpotLight.position.set(0, 2.5, 3.5);
blueSpotLight.intensity = 10;
scene.add(blueSpotLight);

const purpleSpotLight = new THREE.SpotLight(
  "purple",
  4.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
purpleSpotLight.position.set(1, 5, 3.5);
purpleSpotLight.intensity = 15;
scene.add(purpleSpotLight);

/**
 * Model
 */
let mixer = null;
gltfLoader.load("/models/CesiumMan/glTF/CesiumMan.gltf", (gltf) => {
  gltf.scene.scale.set(3, 3, 3);
  scene.add(gltf.scene);
  console.log(gltf);
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);
  action.play();
});

// SIZES
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// FLOOR
const material = new THREE.MeshStandardMaterial();

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), material);
plane.rotation.x = -Math.PI * 0.5;
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
camera.position.set(2, 6, 4);

scene.add(camera);

// CONTROL
const controls = new OrbitControls(camera, canvas);
controls.target.y = 1.5;
controls.enableDamping = true;

// RENDERER
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATION
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  camera.position.x = Math.sin(elapsedTime) * 5;
  camera.position.z = Math.sin(elapsedTime - 0.5) * 2;

  yellowSpotLight.intensity = Math.sin(elapsedTime) * 10;
  blueSpotLight.position.x = Math.sin(elapsedTime) * 3;
  purpleSpotLight.intensity = -Math.sin(elapsedTime) * 10;

  controls.update();

  if (mixer) {
    mixer.update(deltaTime);
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
