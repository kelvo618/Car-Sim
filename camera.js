import * as THREE from 'three';
// Camera modes: chase, hood. (Cockpit/free/reverse come in Milestone 3.)
export class CamRig {
  constructor(cam) { this.cam = cam; this.mode = 0; this.ang = 0; this.pos = new THREE.Vector3(); this.tmp = new THREE.Vector3(); }
  next() { this.mode = (this.mode + 1) % 2; }
  update(v, view, dt) {
    const sp = Math.abs(v.vx); let da = v.h - this.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); this.ang += da * Math.min(1, dt * 3);
    if (this.mode === 0) {
      const d = 6.5 + sp * 0.04, f = new THREE.Vector3(Math.sin(this.ang), 0, Math.cos(this.ang));
      const want = new THREE.Vector3(v.x, 2.3 + sp * 0.01, v.z).addScaledVector(f, -d);
      this.pos.lerp(want, Math.min(1, dt * 6)); this.cam.position.copy(this.pos);
      this.cam.lookAt(v.x + f.x * 4, 1.1, v.z + f.z * 4);
    } else {
      view.root.updateMatrixWorld(true);
      this.cam.position.copy(view.tilt.localToWorld(this.tmp.set(0, 1.25, view.def.L * 0.1)));
      this.cam.lookAt(view.tilt.localToWorld(new THREE.Vector3(0, 1.2, 12)));
    }
    const fov = 62 + Math.min(14, sp * 0.25); this.cam.fov += (fov - this.cam.fov) * Math.min(1, dt * 3); this.cam.updateProjectionMatrix();
  }
}
