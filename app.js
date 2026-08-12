import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const app = document.getElementById("app");
const levelName = document.getElementById("levelName");
const levelBar = document.getElementById("levelBar");
const hint = document.getElementById("hint");
const loading = document.getElementById("loading");
const surfaceUI = document.getElementById("surfaceUI");
const trollUI = document.getElementById("trollUI");
const destroyBtn = document.getElementById("destroyBtn");
const closeTroll = document.getElementById("closeTroll");
const video = document.getElementById("trollVideo");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010208);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.01, 5000);
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.55,
  0.8,
  0.82
);
composer.addPass(bloom);

/* ---------- stars ---------- */
function makeStars(count, radius, size, opacity) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.pow(Math.random(), 0.55);
    const a = Math.random() * Math.PI * 2;
    const z = (Math.random() * 2 - 1) * r;
    const q = Math.sqrt(Math.max(0, r * r - z * z));
    pos[i*3] = Math.cos(a) * q;
    pos[i*3+1] = Math.sin(a) * q;
    pos[i*3+2] = z;
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc9e6ff,
    size,
    transparent: true,
    opacity,
    depthWrite: false
  });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars(9000, 1500, 0.75, 0.8));
scene.add(makeStars(2500, 650, 1.2, 0.65));

/* ---------- procedural spiral galaxy ---------- */
const galaxyGroup = new THREE.Group();
const galaxyGeo = new THREE.BufferGeometry();
const galaxyCount = 12000;
const galaxyPos = new Float32Array(galaxyCount * 3);
const galaxyCol = new Float32Array(galaxyCount * 3);
const c1 = new THREE.Color(0x8bbdff);
const c2 = new THREE.Color(0xffd6a0);

for (let i = 0; i < galaxyCount; i++) {
  const arm = i % 4;
  const radius = Math.pow(Math.random(), 0.58) * 18;
  const angle = radius * 0.48 + arm * Math.PI * 0.5 + (Math.random() - 0.5) * 0.65;
  const spread = (Math.random() - 0.5) * (0.3 + radius * 0.055);
  galaxyPos[i*3] = Math.cos(angle) * radius + Math.cos(angle + Math.PI/2) * spread;
  galaxyPos[i*3+1] = (Math.random() - 0.5) * (0.45 + radius * 0.045);
  galaxyPos[i*3+2] = Math.sin(angle) * radius + Math.sin(angle + Math.PI/2) * spread;
  const color = c1.clone().lerp(c2, Math.pow(Math.random(), 3));
  galaxyCol[i*3] = color.r;
  galaxyCol[i*3+1] = color.g;
  galaxyCol[i*3+2] = color.b;
}
galaxyGeo.setAttribute("position", new THREE.BufferAttribute(galaxyPos, 3));
galaxyGeo.setAttribute("color", new THREE.BufferAttribute(galaxyCol, 3));
const galaxyMat = new THREE.PointsMaterial({
  size: 0.075,
  vertexColors: true,
  transparent: true,
  opacity: 0.95,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});
const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
galaxy.rotation.x = 0.45;
galaxyGroup.add(galaxy);

const core = new THREE.Mesh(
  new THREE.SphereGeometry(2.2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffe8bd })
);
core.material.transparent = true;
core.material.opacity = 0.5;
galaxyGroup.add(core);
galaxyGroup.position.set(0, 0, -42);
scene.add(galaxyGroup);

/* ---------- solar system ---------- */
const solar = new THREE.Group();
solar.visible = false;
scene.add(solar);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(2.1, 48, 48),
  new THREE.MeshStandardMaterial({
    color: 0xffb11a,
    emissive: 0xff6a00,
    emissiveIntensity: 2.8,
    roughness: 0.5
  })
);
solar.add(sun);
const sunLight = new THREE.PointLight(0xffc46b, 6, 100);
solar.add(sunLight);

function orbit(radius, color, size, speed) {
  const pivot = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0 })
  );
  mesh.position.x = radius;
  pivot.add(mesh);
  solar.add(pivot);
  return { pivot, mesh, speed };
}

const mercury = orbit(5, 0xaaa39a, 0.35, 1.8);
const venus = orbit(7, 0xd3a15b, 0.55, 1.15);
const earth = orbit(9.5, 0x3279c7, 0.7, 0.8);
const mars = orbit(12, 0xb9573a, 0.5, 0.58);

/* ---------- Earth close-up ---------- */
const earthClose = new THREE.Group();
earthClose.visible = false;
scene.add(earthClose);

const earthMesh = new THREE.Mesh(
  new THREE.SphereGeometry(3.2, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0x2d75bd,
    roughness: 0.85,
    metalness: 0,
    emissive: 0x031321,
    emissiveIntensity: 0.25
  })
);
earthClose.add(earthMesh);

const cloudMesh = new THREE.Mesh(
  new THREE.SphereGeometry(3.27, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.11,
    roughness: 1
  })
);
earthClose.add(cloudMesh);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(3.38, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x59cfff,
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  })
);
earthClose.add(atmosphere);

const earthLight = new THREE.DirectionalLight(0xffffff, 3.2);
earthLight.position.set(6, 3, 7);
earthClose.add(earthLight);
earthClose.add(new THREE.AmbientLight(0x29476d, 0.22));

/* ---------- surface ---------- */
const surface = new THREE.Group();
surface.visible = false;
scene.add(surface);

const surfaceFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x273522, roughness: 1 })
);
surfaceFloor.rotation.x = -Math.PI / 2;
surfaceFloor.position.y = -2.8;
surface.add(surfaceFloor);

const surfaceLight = new THREE.DirectionalLight(0xfff0cf, 2.8);
surfaceLight.position.set(-10, 18, 8);
surface.add(surfaceLight);
surface.add(new THREE.HemisphereLight(0x6ea8d8, 0x1c2817, 1.2));

/* ---------- navigation ---------- */
let targetDepth = 0;
let depth = 0;
const MAX_DEPTH = 4;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function setDepth(delta) {
  targetDepth = clamp(targetDepth + delta, 0, MAX_DEPTH);
  hint.textContent = targetDepth >= 3.9 ? "Planetary control unlocked" : "Scroll to travel deeper into space";
}

addEventListener("wheel", e => setDepth(e.deltaY * 0.0017), { passive: true });

let lastY = null;
addEventListener("pointerdown", e => { lastY = e.clientY; });
addEventListener("pointermove", e => {
  if (lastY === null) return;
  const dy = lastY - e.clientY;
  if (Math.abs(dy) > 1) setDepth(dy * 0.0022);
  lastY = e.clientY;
});
addEventListener("pointerup", () => lastY = null);
addEventListener("pointercancel", () => lastY = null);

function updateWorld(dt) {
  depth += (targetDepth - depth) * Math.min(1, dt * 5.5);

  const t = depth / MAX_DEPTH;
  levelBar.style.width = `${t * 100}%`;

  let name = "UNIVERSE";
  if (depth >= 0.75) name = "GALAXY";
  if (depth >= 1.65) name = "SOLAR SYSTEM";
  if (depth >= 2.65) name = "PLANET";
  if (depth >= 3.55) name = "SURFACE";
  levelName.textContent = name;

  galaxyGroup.visible = depth < 2.3;
  solar.visible = depth > 1.15 && depth < 3.25;
  earthClose.visible = depth >= 2.45 && depth < 3.75;
  surface.visible = depth >= 3.55;

  const galaxyScale = 0.45 + depth * 0.55;
  galaxyGroup.scale.setScalar(galaxyScale);
  galaxyGroup.rotation.y += dt * 0.015;

  const solarBlend = clamp((depth - 1.1) / 0.9, 0, 1);
  solar.scale.setScalar(0.18 + solarBlend * 0.95);
  solar.position.z = -2 - solarBlend * 4;

  const planetBlend = clamp((depth - 2.35) / 1.15, 0, 1);
  earthClose.scale.setScalar(0.15 + planetBlend * 1.2);
  earthClose.position.set(0, 0, -5 + planetBlend * 4);
  earthMesh.rotation.y += dt * 0.18;
  cloudMesh.rotation.y += dt * 0.22;

  const surfaceBlend = clamp((depth - 3.45) / 0.55, 0, 1);
  surface.position.y = -5 + surfaceBlend * 5;
  surface.rotation.y = (1 - surfaceBlend) * 0.15;

  /* Camera is deliberately eased rather than snapped. */
  const camZ = 15 - depth * 4.1;
  const camY = Math.sin(depth * 0.75) * 0.7;
  camera.position.x += (Math.sin(depth * 0.65) * 1.2 - camera.position.x) * Math.min(1, dt * 2);
  camera.position.y += (camY - camera.position.y) * Math.min(1, dt * 2);
  camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 2);
  camera.lookAt(0, 0, depth > 3.5 ? -1 : -5);
}

/* ---------- troll ---------- */
let trollOpen = false;

destroyBtn.addEventListener("click", async () => {
  trollOpen = true;
  surfaceUI.classList.remove("visible");
  surfaceUI.setAttribute("aria-hidden", "true");
  trollUI.classList.add("visible");
  trollUI.setAttribute("aria-hidden", "false");

  video.currentTime = 0;
  try {
    await video.play(); // User gesture: browsers normally permit audio here.
  } catch {
    // If a browser blocks playback, controls remain available.
  }
});

closeTroll.addEventListener("click", () => {
  video.pause();
  video.currentTime = 0;
  trollUI.classList.remove("visible");
  trollUI.setAttribute("aria-hidden", "true");
  trollOpen = false;
});

function checkSurfaceUI() {
  const unlocked = depth > 3.88 && !trollOpen;
  surfaceUI.classList.toggle("visible", unlocked);
  surfaceUI.setAttribute("aria-hidden", String(!unlocked));
}

/* ---------- render loop ---------- */
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);

  mercury.pivot.rotation.y += dt * mercury.speed;
  venus.pivot.rotation.y += dt * venus.speed;
  earth.pivot.rotation.y += dt * earth.speed;
  mars.pivot.rotation.y += dt * mars.speed;
  sun.rotation.y += dt * 0.08;

  updateWorld(dt);
  checkSurfaceUI();
  composer.render();
}
animate();

setTimeout(() => loading.classList.add("done"), 700);

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});
