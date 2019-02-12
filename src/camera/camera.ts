import { mat4 } from 'gl-matrix';
import { Vector3 } from '../interfaces/interface';

export class Camera {
	public position: Vector3 = { x: 0, y: 0, z: 0 };
	public type: string;
	public lookAtPosition: Vector3 = { x: 0, y: 0, z: 0 };
	public viewMatrix: mat4 = mat4.create();
	public projectionMatrix: mat4 = mat4.create();

	constructor(type: string = 'camera') {
		this.type = type;
	}

	public updatePosition(xx = 0, yy = 0, zz = 0) {
		this.position.x = xx;
		this.position.y = yy;
		this.position.z = zz;
	}

	public updateLookAtPosition(xx = 0, yy = 0, zz = -100) {
		this.lookAtPosition.x = xx;
		this.lookAtPosition.y = yy;
		this.lookAtPosition.z = zz;
	}

	public updateViewMatrix() {
		mat4.lookAt(
			this.viewMatrix,
			[this.position.x, this.position.y, this.position.z],
			[this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z],
			[0, 1, 0]
		);
	}
}

export class PerspectiveCamera extends Camera {
	constructor(
		width: number,
		height: number,
		fov: number = 45,
		near: number = 0.1,
		far: number = 1000
	) {
		super('perspective');
		this.updatePerspective(width, height, fov, near, far);
	}

	public updatePerspective(
		width: number,
		height: number,
		fov: number,
		near: number,
		far: number
	) {
		mat4.perspective(this.projectionMatrix, (fov / 180) * Math.PI, width / height, near, far);
	}
}

export class OrthoCamera extends Camera {
	constructor(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	) {
		super('ortho');
		this.updatePerspective(left, right, bottom, top, near, far);
	}

	public updatePerspective(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	) {
		mat4.ortho(this.projectionMatrix, left, right, bottom, top, near, far);
	}
}
