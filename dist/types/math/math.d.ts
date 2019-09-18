import { Vector3 } from '../interfaces/interface';
export declare function clamp(value: number, min: number, max: number): number;
export declare function range(min: number, max: number): number;
export declare function calculateCircleCenter(A: Vector3, B: Vector3, C: Vector3): {
    x: number;
    y: number;
    z: number;
};
export declare function mix(x: number, y: number, a: number): number;
export declare function degToRad(value: number): number;
export declare function radToDeg(value: number): number;
