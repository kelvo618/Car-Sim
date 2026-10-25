# CarSim – Milestone 1 setup (Unity 2022.3 LTS, URP or Built-in)

Status: code written but NOT compiled or run in Unity yet. Expect small fixes on first import.

## 1. Project
1. Unity Hub > New project > "3D (URP)" on 2022.3 LTS. Copy `Assets/Scripts` into it.
2. Edit > Project Settings > Player > Other Settings > Active Input Handling = **Both**.
3. Android: Build Settings > Android, Scripting Backend IL2CPP, ARM64.

## 2. Test scene
1. 3D Object > Plane, scale (50,1,50). Add a few Cubes as ramps/obstacles.
2. Car root: empty GameObject "Car" at (0,1,0). Add **Rigidbody**, **VehicleController**, **PlayerVehicleInput**.
3. Child "Body": Cube scale (1.8, 0.6, 4.2) (placeholder). Add a BoxCollider on the root or Body.
4. Four child empties with **WheelCollider** (radius 0.34): FL (-0.8,0.3,1.3), FR (0.8,0.3,1.3), RL (-0.8,0.3,-1.3), RR (0.8,0.3,-1.3).
5. Four Cylinders (rotate Z=90, scale 0.68,0.1,0.68) as wheel meshes; **not** children of the wheel colliders.
6. VehicleController: assign Front (FL/FR + meshes, Steer ✔) and Rear (RL/RR + meshes).
7. Project: Create > CarSim > Vehicle Config; assign to the controller. Leave defaults for the sedan.
8. Main Camera: add **FollowCamera**, target = Car. Empty "Game": add **SceneBootstrap** and **DebugHud** (vehicle = Car).
9. Play. W/S = throttle/brake-reverse, A/D = steer, Space = handbrake, Q/E = shift (uncheck Automatic).

## 3. Touch controls (quick)
Add UI Buttons; add EventTrigger PointerDown/PointerUp calling PlayerVehicleInput
ThrottleDown/Up, BrakeDown/Up, HandbrakeDown/Up. Steering: a UI Slider (-1..1) calling SetSteer, or enable `useTilt`.
