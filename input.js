// Unified input: keyboard, touch buttons, gamepad. Output: {throttle, brake, steer(-1..1, left+), hand}
export class Input {
  constructor(cb) {
    this.s = {throttle:0, brake:0, steer:0, hand:false}; this.k = new Set(); this.t = new Set(); this.cb = cb; this.st = 0;
    addEventListener('keydown', e => { if (!this.k.has(e.code)) { this.k.add(e.code); this.once(e.code); } if (e.code === 'Space') e.preventDefault(); });
    addEventListener('keyup', e => this.k.delete(e.code));
    document.querySelectorAll('[data-a]').forEach(el => {
      const on = e => { this.t.add(el.dataset.a); el.classList.add('on'); e.preventDefault(); };
      const off = () => { this.t.delete(el.dataset.a); el.classList.remove('on'); };
      el.addEventListener('pointerdown', on); ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => el.addEventListener(n, off));
    });
    for (const [id, fn] of [['cam', 'cam'], ['car', 'car'], ['gfx', 'gfx']]) document.getElementById(id).onclick = () => cb[fn]();
  }
  once(c) { const m = {KeyC:'cam', KeyG:'gfx', KeyR:'reset', Digit1:0, Digit2:1, Digit3:2}[c]; if (m === undefined) return; typeof m === 'number' ? this.cb.car(m) : this.cb[m](); }
  update(dt) {
    const K = c => this.k.has(c), T = a => this.t.has(a), gp = (navigator.getGamepads?.() || [])[0];
    let th = (K('KeyW') || K('ArrowUp') || T('gas')) ? 1 : 0, br = (K('KeyS') || K('ArrowDown') || T('brake')) ? 1 : 0;
    let tgt = ((K('KeyA') || K('ArrowLeft') || T('left')) ? 1 : 0) - ((K('KeyD') || K('ArrowRight') || T('right')) ? 1 : 0);
    if (gp) { th = Math.max(th, gp.buttons[7]?.value || 0); br = Math.max(br, gp.buttons[6]?.value || 0); if (Math.abs(gp.axes[0]) > 0.08) tgt = -gp.axes[0]; }
    const rate = tgt === 0 ? 6 : 3.5; this.st += (tgt - this.st) * Math.min(1, dt * rate);
    Object.assign(this.s, {throttle:th, brake:br, steer:this.st, hand:K('Space') || T('hand') || !!gp?.buttons[0]?.pressed});
    return this.s;
  }
}
