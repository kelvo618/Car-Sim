// Data-driven vehicle definitions. Add a car = add an entry (placeholder generic shapes, no real brands).
export const CARS = {
  sedan:  {name:'Economy Sedan', mass:1250, L:2.65, front:0.58, h:0.52, torque:200, peak:4200, gears:[3.6,2.1,1.4,1.0,0.8], final:3.9, mu:1.0, fgrip:0.95, cdA:0.7, brake:11000, eb:300, drv:'FWD', maxSteer:0.55, color:0x3b6fb6, dim:[1.8,4.3,0.6,0.5]},
  sports: {name:'Sports Car',    mass:1300, L:2.6,  front:0.46, h:0.45, torque:430, peak:5000, gears:[3.2,2.2,1.6,1.25,1.0,0.82], final:3.7, mu:1.25, fgrip:1.0, cdA:0.62, brake:16000, eb:250, drv:'RWD', maxSteer:0.5, color:0xd23a2a, dim:[1.9,4.2,0.5,0.42]},
  suv:    {name:'SUV',           mass:2100, L:2.9,  front:0.55, h:0.78, torque:400, peak:3800, gears:[3.9,2.3,1.5,1.0,0.78], final:3.8, mu:0.95, fgrip:0.92, cdA:1.0, brake:14000, eb:420, drv:'AWD', maxSteer:0.5, color:0x3d4a3a, dim:[2.0,4.7,0.85,0.7]},
};
