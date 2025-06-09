import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(100));
scene.add(new THREE.GridHelper(100, 10));

// Camera setup
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);

// Renderer
const canvas = document.getElementById('solar3D');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const controls = new OrbitControls(camera, renderer.domElement);

const loader = new THREE.TextureLoader();

const objectTextures = {
  space: './public/textures/space.jpg',
  sun: './public/textures/sun.jpg',
  mercury: './public/textures/mercury.jpg',
  venus: './public/textures/venus.jpg'
}

// Load background
const spaceTexture = loadTexture(loader, objectTextures, 'space');
if (spaceTexture) {
  spaceTexture.colorSpace = THREE.SRGBColorSpace;
  scene.background = spaceTexture;
}

const planetObjects = [
  {
    name: 'mercury',
    color: '#A9863C',
    distanceFromSun: 0.4, // AU (scaled)
    radius: 2440, // km
    orbitalPeriod: 88, // Earth days
    // texture: 'textures/mercury.jpg'
  },
  {
    name: 'venus',
    color: '#D1C295',
    distanceFromSun: 0.7, // AU
    radius: 6052, // km
    orbitalPeriod: 225, // Earth days
    // // texture: 'textures/venus.jpg'
  },
  {
    name: 'Earth',
    color: '#3299CC',
    distanceFromSun: 1.0, // AU
    radius: 6371, // km
    orbitalPeriod: 365.25, // Earth days
    // // texture: 'textures/earth.jpg',
    hasMoon: true
  },
  {
    name: 'Mars',
    color: '#B22222',
    distanceFromSun: 1.5, // AU
    radius: 3390, // km
    orbitalPeriod: 687, // Earth days
    // // texture: 'textures/mars.jpg'
  },
  {
    name: 'Jupiter',
    color: '#D1BE9C',
    distanceFromSun: 5.2, // AU
    radius: 69911, // km
    orbitalPeriod: 4331, // Earth days (~11.86 years)
    // // texture: 'textures/jupiter.jpg',
    hasRings: false
  },
  {
    name: 'Saturn',
    color: '#E0C589',
    distanceFromSun: 9.5, // AU
    radius: 58232, // km
    orbitalPeriod: 10747, // Earth days (~29.46 years)
    // // texture: 'textures/saturn.jpg',
    hasRings: true,
    ringColor: '#D3CBB1',
    ringInnerRadius: 75000,
    ringOuterRadius: 150000
  },
  {
    name: 'Uranus',
    color: '#A3EED3',
    distanceFromSun: 19.8, // AU
    radius: 25362, // km
    orbitalPeriod: 30589, // Earth days (~83.7 years)
    // // texture: 'textures/uranus.jpg',
    hasRings: true,
    ringColor: '#888888'
  },
  {
    name: 'Neptune',
    color: '#3E66F9',
    distanceFromSun: 30.0, // AU
    radius: 24622, // km
    orbitalPeriod: 59800, // Earth days (~163.7 years)
    // // texture: 'textures/neptune.jpg',
    hasRings: true,
    ringColor: '#777777'
  },
  {
    name: 'Pluto',
    color: '#CDAA87',
    distanceFromSun: 39.5, // AU
    radius: 1188, // km
    orbitalPeriod: 90520, // Earth days (~247.9 years),
    // // texture: 'textures/pluto.jpg',
    isDwarfPlanet: true
  }
];

const solarSystem = new THREE.Object3D();
scene.add(solarSystem);

const sphereGeometry = new THREE.SphereGeometry(1, 30, 30);

// ---- SUN ----
const sunTexture = loadTexture(loader, objectTextures, 'sun');
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
sunMesh.scale.set(2, 2, 2);
solarSystem.add(sunMesh);

// Store animated objects
const objects = [solarSystem, sunMesh];
const planets = [];

// Add planets
(async function() {
  for (const planet of planetObjects) {
    const texture = await loadTexture(loader, objectTextures, planet.name);
    await addPlanet(planet, scene, texture);
  }
})();


function resizeRendererToDisplaySize(renderer) {  //Fix distorted edges
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needsResize = canvas.width !== width || canvas.height !== height;
  if (needsResize) {
    renderer.setSize(width, height, false);
  }

  return needsResize;
}

function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();

  objects.forEach(obj => {
    obj.rotation.y = time;
  });

  planets.forEach(p => {
    const { orbitSpeed, orbitRadius } = p.userData;
    p.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
    p.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function loadTexture(loader, objectTextures, objectName) {
  const url = objectTextures[objectName];

  if (!url) {
    console.warn(`No texture found for key: ${objectName}`);
    return null;
  }

  const texture = loader.load(
    url,
    () => {
      // onLoad callback
      console.log(`Loaded texture: ${objectName}`);
    },
    undefined, // onProgress
    (err) => {
      console.error(`Failed to load texture: ${url}`, err);
    }
  );
  return texture;
}

async function addPlanet(data) {
  const scaleDistance = 10;
  const scaleSize = 0.5;

  // const texture = loadTexture(loader, objectTextures, data.name.toLowerCase());
  const material = data.texture
    ? new THREE.MeshStandardMaterial({ map: texture })
    : new THREE.MeshStandardMaterial({ color: data.color });

  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.position.x = data.distanceFromSun * scaleDistance;
  mesh.scale.setScalar((data.radius / 6371) * scaleSize); // Normalize Earth size
  solarSystem.add(mesh);

  mesh.userData = {
    orbitRadius: data.distanceFromSun * scaleDistance,
    orbitSpeed: (365 / data.orbitalPeriod) * 0.01
  };

  // planets.push(mesh);
  // objects.push(mesh);
}
