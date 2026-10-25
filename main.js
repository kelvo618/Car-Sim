import * as THREE from 'three';
import {CARS} from './defs.js';
import {Vehicle} from './vehicle.js';
import {CarView} from './car-view.js';
import {Input} from './input.js';
import {buildWorld} from './world.js';
import {CamRig} from './camera.js';

const renderer = new THREE.WebGLRenderer({antialias:false, powerPreference:'high-performance'});
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9ec7e8); scene.fog = new THREE.Fog(0x9ec7e8, 120, 700);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1500);
scene.add(new THREE.HemisphereLight(0xcfe6ff, 0x4b5a3c, 0.9));
const sun = new THREE.DirectionalLight(0xfff1d6, 2.2); sun.position.set(60, 90, 40); sun.castShadow = true;
Object.assign(sun.shadow.camera, {left:-50, right:50, top:50, bottom:-50, near:1, far:250}); sun.shadow.bias = -0.0005; scene.add(sun, sun.target);
const world = buildWorld(scene);

// graphics presets: 0 low, 1 medium, 2 high
let gfx = +(localStorage.getItem('gfx') ?? (matchMedia('(pointer:coarse)').matches ? 0 : 2));
function applyGfx() {
  const q = [{pr:1, sh:false, ss:0}, {pr:Math.min(devicePixelRatio, 1.5), sh:true, ss:1024}, {pr:Math.min(devicePixelRatio, 2), sh:true, ss:2048}][gfx];
  renderer.setPixelRatio(q.pr); renderer.shadowMap.enabled = q.sh; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (q.sh) { sun.shadow.mapSize.set(q.ss, q.ss); sun.shadow.map?.dispose(); sun.shadow.map = null; }
  scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); resize();
  document.getElementById('gfx').textContent = ['Low', 'Med', 'High'][gfx];
}
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);

const keys = Object.keys(CARS); let ci = 0, veh, view;
const START = {x:7, z:30, h:0};
function spawn(i) {
  ci = i % keys.length; if (view) scene.remove(view.root);
  const def = CARS[keys[ci]]; veh = new Vehicle(def); veh.reset(START.x, START.z, START.h); view = new CarView(def); scene.add(view.root);
  document.getElementById('name').textContent = `${def.name} · ${def.drv} · ${def.mass} kg`;
}
const rig = new CamRig(camera);
const input = new Input({cam:() => rig.next(), car:i => spawn(i ?? ci + 1), gfx:() => { gfx = (gfx + 1) % 3; localStorage.setItem('gfx', gfx); applyGfx(); }, reset:() => veh.reset(START.x, START.z, START.h)});
spawn(0); applyGfx();

// crude building collision (AABB push-out + speed loss); proper collision/damage arrives later
function collide(v) {
  for (const s of world.solids) {
    const dx = v.x - s.x, dz = v.z - s.z, ox = s.hw + 1.2 - Math.abs(dx), oz = s.hd + 1.2 - Math.abs(dz);
    if (ox > 0 && oz > 0) { if (ox < oz) v.x += Math.sign(dx) * ox; else v.z += Math.sign(dz) * oz; v.vx *= 0.3; v.vy *= 0.3; }
  }
}
const $ = id => document.getElementById(id); let last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  veh.update(input.update(dt), dt); collide(veh); view.sync(veh, dt); rig.update(veh, view, dt);
  sun.position.set(veh.x + 60, 90, veh.z + 40); sun.target.position.set(veh.x, 0, veh.z);
  $('spd').firstChild.nodeValue = Math.round(Math.abs(veh.kmh));
  $('gear').textContent = veh.gear < 0 ? 'R' : 'D' + veh.gear; $('rpm').style.width = Math.min(100, veh.rpm / 70) + '%';
  renderer.render(scene, camera);
});
