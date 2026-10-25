// Vehicle physics (no rendering). Body frame: x forward, y left, yaw r (CCW+). Steer: left positive.
const G = 9.81, RW = 0.33, K = 7;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export class Vehicle {
  constructor(def) { this.def = def; this.reset(0, 0, 0); }
  reset(x, z, h) { Object.assign(this, {x, z, h, vx:0, vy:0, r:0, gear:1, rpm:1000, steer:0, ax:0, ay:0, shiftT:0, braking:false, slip:0}); }
  get kmh() { return this.vx * 3.6; }
  update(inp, dt) { const n = Math.max(1, Math.ceil(dt / 0.005)); for (let i = 0; i < n; i++) this.step(inp, dt / n); }
  step(inp, dt) {
    const d = this.def, m = d.mass, L = d.L, a = L * (1 - d.front), b = L * d.front, Iz = m * a * b * 1.2;
    // steering: smoothed, reduced at speed
    const tgt = inp.steer * d.maxSteer / (1 + (Math.abs(this.vx) / 16) ** 2);
    this.steer += (tgt - this.steer) * Math.min(1, dt * 8);
    const dl = this.steer, vx = this.vx, sgn = vx >= 0 ? 1 : -1;
    // auto gearbox / reverse
    if (this.gear > 0 && vx < 0.5 && inp.brake > 0.1 && inp.throttle < 0.1) this.gear = -1;
    else if (this.gear < 0 && vx > -0.5 && inp.throttle > 0.1) this.gear = 1;
    const drive = this.gear < 0 ? inp.brake : inp.throttle, brk = this.gear < 0 ? inp.throttle : inp.brake;
    const ratio = this.gear > 0 ? d.gears[this.gear - 1] : -3.2, tot = ratio * d.final;
    let rpm = Math.max(1000, Math.abs(vx) / RW * Math.abs(tot) * 9.549);
    this.shiftT -= dt;
    if (this.gear > 0 && this.shiftT <= 0) {
      if (rpm > 6000 && this.gear < d.gears.length) { this.gear++; this.shiftT = 0.35; }
      else if (rpm < 2300 && this.gear > 1) { this.gear--; this.shiftT = 0.25; }
    }
    this.rpm += (Math.min(rpm, 6800) - this.rpm) * Math.min(1, dt * 15);
    // weight transfer
    const Nf = Math.max(0.12 * m * G, m * G * b / L - m * this.ax * d.h / L), Nr = Math.max(0.12 * m * G, m * G - Nf);
    // longitudinal
    let T = d.torque * clamp(1 - ((rpm - d.peak) / 4800) ** 2, 0.3, 1) * drive;
    if (rpm > 6600 || this.shiftT > 0) T = 0;
    const Fd = T * tot * 0.9 / RW, share = d.drv === 'RWD' ? 1 : d.drv === 'FWD' ? 0 : 0.5;
    const muF = d.mu * d.fgrip, muR = d.mu * (inp.hand ? 0.4 : 1);
    const Fxr = clamp(Fd * share, -muR * Nr, muR * Nr), Fxf = clamp(Fd * (1 - share), -muF * Nf, muF * Nf);
    const Feb = drive < 0.05 && this.shiftT <= 0 ? -sgn * Math.min(1, Math.abs(vx)) * d.eb * (rpm / 6000) : 0;
    let Fb = Math.min(brk * d.brake + (inp.hand ? d.brake * 0.4 : 0), d.mu * m * G);
    Fb = -sgn * Math.min(Fb, Math.abs(vx) * m / dt * 0.9);
    const drag = 0.5 * 1.2 * d.cdA * vx * Math.abs(vx) + 0.015 * m * G * Math.tanh(vx * 3);
    const Fx = Fxr + Fxf + Feb + Fb - drag;
    // lateral (tanh tyre curve + friction circle on driven axle)
    const ve = Math.max(Math.abs(vx), 0.8);
    const af = Math.atan((this.vy + a * this.r) / ve) - dl * sgn, ar = Math.atan((this.vy - b * this.r) / ve);
    const fc = (fx, mu, N) => Math.sqrt(Math.max(0.05, 1 - (fx / (mu * N)) ** 2));
    const Fyf = -muF * Nf * Math.tanh(K * af) * fc(Fxf, muF, Nf), Fyr = -muR * Nr * Math.tanh(K * ar) * fc(Fxr, muR, Nr);
    const cd = Math.cos(dl), sd = Math.sin(dl);
    const ax = (Fx - Fyf * sd) / m, ay = (Fyf * cd + Fyr) / m;
    this.vx += (ax + this.vy * this.r) * dt;
    this.vy += (ay - vx * this.r) * dt;
    this.r += ((a * Fyf * cd - b * Fyr) / Iz) * dt;
    // low-speed stabilisation (kinematic blend)
    const sp = Math.abs(this.vx);
    if (sp < 4) { const w = 1 - sp / 4; this.vy -= this.vy * Math.min(1, w * dt * 12); this.r += (this.vx * Math.tan(dl) / L - this.r) * Math.min(1, w * dt * 10); }
    if (drive < 0.02 && sp < 0.15) this.vx = 0;
    this.ax += (ax - this.ax) * Math.min(1, dt * 8); this.ay += (ay - this.ay) * Math.min(1, dt * 8);
    this.slip = Math.max(Math.abs(af), Math.abs(ar)); this.braking = brk > 0.05;
    this.h += this.r * dt;
    const c = Math.cos(this.h), s = Math.sin(this.h);
    this.x += (this.vx * s + this.vy * c) * dt; this.z += (this.vx * c - this.vy * s) * dt;
  }
}
