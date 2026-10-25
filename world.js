import * as THREE from 'three';
// Test environment: repeating road grid (120m blocks, 14m roads) + seeded block buildings. Replaced by a real map in Milestone 10.
export const TILE = 120, ROAD = 14, HALF = 480;
export function buildWorld(scene) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), p = 512 / TILE;
  g.fillStyle = '#6d6f6a'; g.fillRect(0, 0, 512, 512); g.fillStyle = '#2b2b2f'; g.fillRect(0, 0, ROAD * p, 512); g.fillRect(0, 0, 512, ROAD * p);
  g.fillStyle = '#e8c63c'; for (let i = ROAD; i < TILE; i += 6) { g.fillRect(ROAD * p / 2 - 1, i * p, 2, 3 * p); g.fillRect(i * p, ROAD * p / 2 - 1, 3 * p, 2); }
  g.fillStyle = '#ddd'; g.fillRect(ROAD * p - 2, 0, 2, 512); g.fillRect(0, ROAD * p - 2, 512, 2); g.fillRect(0, 0, 2, 512); g.fillRect(0, 0, 512, 2);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2 * HALF / TILE, 2 * HALF / TILE); tex.anisotropy = 4; tex.colorSpace = THREE.SRGBColorSpace;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 2 * HALF), new THREE.MeshStandardMaterial({map:tex, roughness:0.95}));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const out = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({color:0x4b6b3c})); out.rotation.x = -Math.PI / 2; out.position.y = -0.05; scene.add(out);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const box = new THREE.BoxGeometry(1, 1, 1), cols = [0xb9b2a5, 0x9aa6b2, 0xc4a98a, 0x8e8e96, 0xa7b59b], mats = cols.map(c => new THREE.MeshStandardMaterial({color:c, roughness:0.9}));
  const solids = [];
  for (let i = 0; i < 2 * HALF / TILE; i++) for (let j = 0; j < 2 * HALF / TILE; j++) {
    const x0 = -HALF + i * TILE + ROAD + 4, z0 = -HALF + j * TILE + ROAD + 4, lot = (TILE - ROAD - 8) / 2;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      if (rnd() < 0.15) continue; const w = lot - 6 - rnd() * 6, dd = lot - 6 - rnd() * 6, h = 6 + rnd() * rnd() * 50;
      const m = new THREE.Mesh(box, mats[(rnd() * 5) | 0]); m.scale.set(w, h, dd); m.position.set(x0 + a * lot + lot / 2, h / 2, z0 + b * lot + lot / 2);
      m.castShadow = m.receiveShadow = true; scene.add(m); solids.push({x:m.position.x, z:m.position.z, hw:w / 2, hd:dd / 2});
    }
  }
  return {solids};
}
