import { mat4 } from 'gl-matrix';
import { Vector3 } from '../interfaces/interface';
export declare class Camera {
    type: string;
    position: Vector3;
    lookAtPosition: Vector3;
    viewMatrix: mat4;
    viewMatrixInverse: mat4;
    projectionMatrix: mat4;
    projectionMatrixInverse: mat4;
    constructor(type?: string);
    updatePosition(xx?: number, yy?: number, zz?: number): void;
    updateLookAtPosition(xx?: number, yy?: number, zz?: number): void;
    updateViewMatrix(): void;
}
export declare class PerspectiveCamera extends Camera {
    private width;
    private height;
    private fov;
    private near;
    private far;
    constructor(width: number, height: number, fov?: number, near?: number, far?: number);
    updatePerspective(): void;
    updateSize(width: number, height: number): void;
    updateFocus(near: number, far: number): void;
    updatefov(angle: number): void;
}
export declare class OrthoCamera extends Camera {
    private left;
    private right;
    private bottom;
    private top;
    private near;
    private far;
    constructor(left: number, right: number, bottom: number, top: number, near: number, far: number);
    updateSize(left: number, right: number, bottom: number, top: number): void;
    updateFocus(near: number, far: number): void;
    updatePerspective(): void;
}
