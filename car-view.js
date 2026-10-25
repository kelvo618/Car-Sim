import * as THREE from 'three';
// Placeholder car model built from primitives, driven by physics state. Swap for glTF models later.
export class CarView {
  constructor(def) {
    this.def = def; this.root = new THREE.Group(); this.tilt = new THREE.Group(); this.root.add(this.tilt);
    const [w, len, bh, ch] = def.dim, paint = new THREE.MeshStandardMaterial({color:def.color, metalness:0.5, roughness:0.35});
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, bh, len), paint); body.position.y = 0.3 + bh / 2; 
    const cab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, ch, len * 0.5), new THREE.MeshStandardMaterial({color:0x111a22, metalness:0.7, roughness:0.15}));
    cab.position.set(0, 0.3 + bh + ch / 2, -len * 0.06);
    this.tailMat = new THREE.MeshStandardMaterial({color:0x550000, emissive:0xff0000, emissiveIntensity:0.3});
    const head = new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffee, emissiveIntensity:0.6});
    for (const s of [-1, 1]) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.05), this.tailMat); t.position.set(s * w * 0.35, 0.3 + bh * 0.7, -len / 2); this.tilt.add(t);
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.05), head); h.position.set(s * w * 0.35, 0.3 + bh * 0.6, len / 2); this.tilt.add(h);
    }
    body.castShadow = cab.castShadow = true; this.tilt.add(body, cab);
    const a = def.L * (1 - def.front), b = def.L * def.front, wg = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 20), wm = new THREE.MeshStandardMaterial({color:0x151515, roughness:0.9});
    this.wheels = [];
    for (const [z, front] of [[a, true], [-b, false]]) for (const s of [-1, 1]) {
      const piv = new THREE.Group(), spin = new THREE.Group(), m = new THREE.Mesh(wg, wm); m.rotation.z = Math.PI / 2; m.castShadow = true;
      spin.add(m); piv.add(spin); piv.position.set(s * (w / 2 - 0.1), 0.33, z); this.tilt.add(piv); this.wheels.push({piv, spin, front});
    }
  }
  sync(v, dt) {
    this.root.position.set(v.x, 0, v.z); this.root.rotation.y = v.h;
    const k = Math.min(1, dt * 6); // visible weight transfer
    this.tilt.rotation.x += (THREE.MathUtils.clamp(-v.ax * 0.006, -0.06, 0.06) - this.tilt.rotation.x) * k;
    this.tilt.rotation.z += (THREE.MathUtils.clamp(v.ay * 0.005, -0.08, 0.08) - this.tilt.rotation.z) * k;
    for (const w of this.wheels) { w.spin.rotation.x += v.vx / 0.33 * dt; if (w.front) w.piv.rotation.y = v.steer; }
    this.tailMat.emissiveIntensity = v.braking ? 2.5 : 0.3;
  }
}
