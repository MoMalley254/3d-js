import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, textureLoader, focusObject = null, sphereGeometry, orbits= {}, planets = [], moons =[];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function initScene() {
  scene = new THREE.Scene();
  // scene.add(new THREE.AxesHelper(100));
  // scene.add(new THREE.GridHelper(100, 10));

  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const starTexture = cubeTextureLoader.load([
    './public/textures/space.jpg', // px
    './public/textures/space.jpg', // nx
    './public/textures/space.jpg', // py
    './public/textures/space.jpg', // ny
    './public/textures/space.jpg', // pz
    './public/textures/space.jpg'  // nz
  ]);
  starTexture.colorSpace = THREE.SRGBColorSpace;

  scene.background = starTexture;

  initCamera();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  initRenderer();
}

function initRenderer() {
  const canvas = document.getElementById('solar3D');
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  controls = new OrbitControls(camera, renderer.domElement);
  textureLoader = new THREE.TextureLoader();

  initSolarSystem();
  animate();
}

function initSolarSystem() {
  sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
  renderSun();
  renderPlanets();
}

function renderSun() {
  textureLoader.load('./public/textures/sun.jpg', (texture) => {
    const sunMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
    sunMesh.name = 'sun';
    sunMesh.scale.set(10, 10, 10);
    sunMesh.position.set(0,0,0);
    scene.add(sunMesh);
  });
}

function renderPlanets() {
  const planetsData = [
    {
      name: 'mercury',
      scale: 0.35,
      posX: -2.85,
      posY: 6.57,
      posZ: 0.57,
      orbitPeriod: 14.4,
      moons: 0,
      texture: './public/textures/mercury.jpg'
    },
    {
      name: 'venus',
      scale: 0.87,
      posX: 10.11,
      posY: -8.33,
      posZ: -0.86,
      orbitPeriod: 37.2,
      moons: 0,
      texture: './public/textures/venus.jpg'
    },
    {
      name: 'earth',
      scale: 0.91,
      posX: -19.42,
      posY: 4.74,
      posZ: 0.0,
      orbitPeriod: 60.0,
      moons: 1,
      moonData: [
        {
          name: 'moon',
          texture: './public/textures/moons/earthMoon.jpg',
          pos: 0.05,
          scale: 0.28
        }
      ],
      texture: './public/textures/earth.jpg'
    },
    {
      name: 'mars',
      scale: 0.49,
      posX: -29.86,
      posY: -5.15,
      posZ: 0.61,
      orbitPeriod: 112.8,
      moons: 1,
      moonData: [
        {
          name: 'phobos',
          texture: './public/textures/moons/earthMoon.jpg',
          pos: 0.05,
          scale: 0.28
        }
      ],
      texture: './public/textures/mars.jpg'
    },
    {
      name: 'jupiter',
      scale: 10.49,
      posX: 78.29,
      posY: 55.15,
      posZ: -1.69,
      orbitPeriod: 711.6,
      moons: 0,
      // moonData: [
      //   {
      //     name: 'phobos',
      //     texture: './public/textures/moons/earthMoon.jpg',
      //     pos: 0.05,
      //     scale: 0.28
      //   }
      // ],
      texture: './public/textures/jupiter.jpg'
    },
    {
      name: 'saturn',
      scale: 8.63,
      posX: 91.78,
      posY: -171.20,
      posZ: 8.40,
      orbitPeriod: 1767.6,
      moons: 0,
      // moonData: [
      //   {
      //     name: 'phobos',
      //     texture: './public/textures/moons/earthMoon.jpg',
      //     pos: 0.05,
      //     scale: 0.28
      //   }
      // ],
      texture: './public/textures/saturn.jpg'
    },
    {
      name: 'uranus',
      scale: 3.64,
      posX: 348.49,
      posY: 42.32,
      posZ: -3.74,
      orbitPeriod: 5040.6,
      moons: 0,
      // moonData: [
      //   {
      //     name: 'phobos',
      //     texture: './public/textures/moons/earthMoon.jpg',
      //     pos: 0.05,
      //     scale: 0.28
      //   }
      // ],
      texture: './public/textures/uranus.jpg'
    },
    {
      name: 'neptune',
      scale: 3.53,
      posX: 527.35,
      posY: -330.94,
      posZ: -8.92,
      orbitPeriod: 9888.0,
      moons: 0,
      // moonData: [
      //   {
      //     name: 'phobos',
      //     texture: './public/textures/moons/earthMoon.jpg',
      //     pos: 0.05,
      //     scale: 0.28
      //   }
      // ],
      texture: './public/textures/neptune.jpg'
    },
  ]

  planetsData.forEach((planet) => {
    renderSinglePlanet(planet);
  })
}

function renderSinglePlanet(planetData) {
  textureLoader.load(planetData.texture, (texture) => {
    console.log(`${planetData.name} texture loaded`);
    const planetMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
    planetMesh.scale.set(planetData.scale, planetData.scale, planetData.scale);
    planetMesh.name = planetData.name;

    if (planetData.moons > 0) {
      planetData.moonData.forEach((moon) => {
        renderSingleMoon(moon, planetData);
      });
    }

    const orbitGroup = new THREE.Object3D();
    orbitGroup.name = planetData.name;
    orbitGroup.position.set(0, 0, 0);
    planetMesh.position.set(planetData.posX + 15, planetData.posY + 15, planetData.posZ + 15);
    orbitGroup.add(planetMesh);
    
    orbits[planetData.name] = {
      group: orbitGroup,
      planet: planetMesh,
      period: planetData.orbitPeriod || 60
    };

    scene.add(orbitGroup);
  });
}

function renderSingleMoon(moonData, parentPlanet) {
  textureLoader.load(moonData.texture, (texture) => {
    console.log(`${moonData.name} texture loaded`);
    const moonMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);

    const moonScale = parentPlanet.scale * moonData.scale;
    moonMesh.scale.set(moonScale, moonScale, moonScale);

    // Place moon offset along x axis from the planet
    const moonX = 15 + parentPlanet.posX + moonData.pos;
    const moonY = 15 + parentPlanet.posY;
    const moonZ = 15 + parentPlanet.posZ;

    moonMesh.position.set(moonX, moonY, moonZ);
    scene.add(moonMesh);
  });
}

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

const clock = new THREE.Clock();
function animate() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));

  const elapsed = clock.getElapsedTime(); // this grows over time correctly

  for (const planetName in orbits) {
    const { group, period } = orbits[planetName];

    // Calculate angle based on orbit period in seconds
    const angle = (elapsed / (period / 4)) * 2 * Math.PI;

    // Rotate around the Y-axis
    group.rotation.y = angle;
  }

  if (focusObject) {
    // console.log(`Focusing on ${focusObject}`);
    scene.traverse((object) => {
      if (object.name === focusObject) {
        const offset = new THREE.Vector3(0, 0, 0); // adjust as needed
        const desiredPosition = new THREE.Vector3().addVectors(object.position, offset);

        // console.log(`Now at ${object.position.x}, ${object.position.y}, ${object.position.z}`);
        // Smooth follow
        camera.position.lerp(desiredPosition, 0.05); // adjust the 0.05 for smoothness speed
        camera.lookAt(object.position);
        controls.target.copy(object.position);
      }
    });
  }

  controls.update();
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('click', (event) => {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    focusonObject(clickedObject);
  }
});

function focusonObject(mesh) {
  const offset = 5; // Distance from the object
  const direction = new THREE.Vector3()
    .subVectors(camera.position, mesh.position)
    .normalize();

  const newCameraPos = new THREE.Vector3()
    .copy(mesh.position)
    // .add(direction.multiplyScalar(offset));

  // Optional: smooth animation using GSAP or manual lerp
  camera.position.copy(newCameraPos);
  camera.lookAt(mesh.position);

  focusObject = mesh.name;

  console.log('You clicked on:', mesh.name);
}


initScene();


