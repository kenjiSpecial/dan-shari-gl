import { mat4 } from 'gl-matrix';
export declare class Camera {
    private type;
    private position;
    private lookAtPosition;
    protected viewMatrix: mat4;
    protected projectionMatrix: mat4;
    constructor(type?: string);
    updatePosition(xx?: number, yy?: number, zz?: number): void;
    updateLookAtPosition(xx?: number, yy?: number, zz?: number): void;
    updateViewMatrix(): void;
}
export declare class PerspectiveCamera extends Camera {
    constructor(width: number, height: number, fov?: number, near?: number, far?: number);
    updatePerspective(width: number, height: number, fov: number, near: number, far: number): void;
}
export declare class OrthoCamera extends Camera {
    constructor(left: number, right: number, bottom: number, top: number, near: number, far: number);
    updatePerspective(left: number, right: number, bottom: number, top: number, near: number, far: number): void;
}
