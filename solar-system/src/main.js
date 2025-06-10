import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, textureLoader, focusObject = null, sphereGeometry, orbits= {}, moonOrbits = {}, planets = [], moons =[];
let solarSystem;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const fullScreenBtn = document.getElementById('fullScreenBtn');
const followDiv = document.getElementById('focusControls');
const focusLabel = document.getElementById('focusLabel');
const focusNameSpan = document.getElementById('focusName');

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
          scale: 0.25
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
      moons: 2,
      moonData: [
        {
          name: 'phobos',
          texture: './public/textures/moons/phobos.jpg',
          pos: 0.05,
          scale: 0.0016
        },
        {
          name: 'deimos',
          texture: './public/textures/moons/deimos.jpg',
          pos: 0.05,
          scale: 0.00086
        },
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
      texture: './public/textures/saturn.jpg',
      rings: 1,
      ringTexture: './public/textures/misc/saturn-rings.png'
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

  initRenderer();
}

function initRenderer() {
  const canvas = document.getElementById('solar3D');
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Camera positioning
  camera.position.set(0, 30, 30);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  textureLoader = new THREE.TextureLoader();

  initSolarSystem();
  animate();
}

function initSolarSystem() {
  sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
  solarSystem = new THREE.Object3D();

  const ambientLight = new THREE.AmbientLight(0x333333, 5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 10000, 300);
  scene.add(pointLight);

  scene.add(solarSystem);
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
    solarSystem.add(sunMesh);
  });
}

function renderPlanets() {
  
  planetsData.forEach((planet) => {
    renderSinglePlanet(planet);
  })
}

function renderSinglePlanet(planetData) {
  textureLoader.load(planetData.texture, (texture) => {
    const planetMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const planetMesh = new THREE.Mesh(sphereGeometry, planetMaterial);
    planetMesh.scale.set(planetData.scale, planetData.scale, planetData.scale);
    planetMesh.name = planetData.name;

    const orbitGroup = new THREE.Object3D();
    orbitGroup.name = planetData.name;
    orbitGroup.position.set(0, 0, 0);
    planetMesh.position.set(planetData.posX + 15, planetData.posY + 15, planetData.posZ + 15);
    orbitGroup.add(planetMesh);

    if (planetData.moons > 0) {
      planetData.moonData.forEach((moon) => {
        renderSingleMoon(moon, planetData, orbitGroup, planetMesh);
      });
    }

    if (planetData.rings > 0) {
      renderPlanetRing(planetData.ringTexture, planetMesh);
    }
    
    orbits[planetData.name] = {
      group: orbitGroup,
      planet: planetMesh,
      distance: (planetData.posX + 15),
      period: planetData.orbitPeriod || 60
    };

    if (planetData.name === 'earth') {
      focusObject = planetData.name;
    }

    solarSystem.add(orbitGroup);
  });
}

function renderSingleMoon(moonData, parentPlanet, planetOrbit, planetMesh) {
  textureLoader.load(moonData.texture, (texture) => {
    const moonMaterial = new THREE.MeshStandardMaterial({ map: texture });
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);

    const moonScale = moonData.scale;
    moonMesh.scale.set(moonScale, moonScale, moonScale);
    // moonMesh.scale.set(1.2, 1.2, 1.2);

    const moonOrbit = new THREE.Object3D();

    // Place moon offset along x axis from the planet
    const moonX = 15 + parentPlanet.posX + moonData.pos;
    const moonY = 15 + parentPlanet.posY;
    const moonZ = 15 + parentPlanet.posZ;

    moonOrbit.position.set(moonX, moonY, moonZ);
    moonOrbit.add(moonMesh);

    moonOrbits[moonData.name] = {
      group: moonOrbit,
      planetOrbit: planetOrbit,
      period: 24,
      radius: moonX
    }

    planetMesh.add(moonOrbit);
  });
}

function renderPlanetRing(ringTexture, planetMesh) {
  textureLoader.load(ringTexture, ((texture) => {
    const ringGeometry = new THREE.RingGeometry(10, 10, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    const planetRing = new THREE.Mesh(ringGeometry, ringMaterial);
    planetMesh.add(planetRing);
    planetRing.position.x = 10;
  }));
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

  // controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()));

  const elapsed = clock.getElapsedTime(); // this grows over time correctly

  for (const planetName in orbits) {
    const { group, planet, period } = orbits[planetName];

    // Calculate angle based on orbit period in seconds
    const angle = (elapsed / (period / 4)) * 2 * Math.PI;

    // Rotate around the Y-axis
    // group.rotation.y = angle;
    planet.rotation.y = angle;
  }

  for (const moonName in moonOrbits) {
    const { group, planetOrbit, period } = moonOrbits[moonName];

    // Calculate angle based on orbit period in seconds
    const angle = (elapsed / (period / 4)) * 2 * Math.PI;

    // Rotate around the Y-axis
    group.rotation.x = angle;
  }
  solarSystem.rotateY(0.004);

  if (focusObject) {
    scene.traverse((object) => {
      if (object.name === focusObject && object.isMesh) { 
        // Camera offset relative to object (local space)
        const camOffset = new THREE.Vector3(0, 15, 15); // Adjust this as needed

        // Calculate camera world position based on object rotation
        const localCamOffset = camOffset.clone();
        const worldCamOffset = localCamOffset.applyQuaternion(object.quaternion);

        const desiredCamPosition = object.position.clone().add(worldCamOffset);

        // Smooth interpolation between current camera position and desired position
        camera.position.lerp(desiredCamPosition, 0.1);

        // Make camera look at the object
        camera.lookAt(object.position);

        // Optional: Update controls if using OrbitControls
        if (controls) {
          controls.target.copy(object.position);
        }
      }
    });
    showFocus(focusObject);
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

// window.addEventListener('resize', (event) => {
//   console.log(`Resized to ${window.innerWidth, window.innerHeight}`);
//   animate();
// });

function focusonObject(mesh) {
  const offset = 5; // Distance from the object
  const direction = new THREE.Vector3().subVectors(camera.position, mesh.position).normalize();

  const newCameraPos = new THREE.Vector3().copy(mesh.position).add(direction.multiplyScalar(offset));

  // Optional: smooth animation using GSAP or manual lerp
  camera.position.copy(newCameraPos);
  camera.lookAt(mesh.position);

  focusObject = mesh.name;
}

function showFocus(focusObject) {

  if (focusObject && focusObject !== '') {
    // Show the label and update its text
    followDiv.style.display = 'block';
    focusNameSpan.textContent = focusObject;
  } else {
    // Hide the label if no focus
    followDiv.style.display = 'none';
  }
}

function stopFocus() {
  // Start countdown
  let count = 3;
  focusLabel.textContent = `Stopping in ${count}`;
  followDiv.style.display = 'block';

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      focusLabel.textContent = `Stopping in ${count}`;
    } else {
      clearInterval(countdownInterval);
      focusObject = null; // Clear focus
      focusLabel.textContent = '';
      followDiv.style.display = 'none';
    }
  }, 1000); // 1 second between counts
}

document.getElementById('clearFocus').addEventListener('click', (e) => {
  stopFocus();
});

fullScreenBtn.addEventListener('click', (e) => {
  fullscreenMod(true);
});

window.addEventListener('keydown', (e) => {
  const pressedKey = e.key;

  switch (pressedKey) {
    case 's':
    case 'S':
      // Handle 'S' key
      stopFocus();
      break;

    case ' ':
      // Handle Spacebar
      stopFocus();
      break;

    case 'f':
    case 'F':
      // Handle 'F' key
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      fullscreenMod(!isFullscreen);
      break;

    case 'Escape':
      // Handle Escape key
      fullscreenMod(false);
      break;

    default:
      // Ignore other keys
      break;
  }
});

function fullscreenMod(state) {
  if (state) {
    const canvas = renderer.domElement;

    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { // Safari
      canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
      canvas.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }
}

initScene();


