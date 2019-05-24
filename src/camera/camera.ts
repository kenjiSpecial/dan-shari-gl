import { mat4 } from 'gl-matrix';
import { Vector3 } from '../interfaces/interface';

export class Camera {
	public type: string;
	public position: Vector3 = { x: 0, y: 0, z: 0 };
	public lookAtPosition: Vector3 = { x: 0, y: 0, z: 0 };
	public viewMatrix: mat4 = mat4.create();
	public viewMatrixInverse: mat4 = mat4.create();
	public projectionMatrix: mat4 = mat4.create();
	public projectionMatrixInverse: mat4 = mat4.create();

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

		mat4.invert(this.viewMatrixInverse, this.viewMatrix);
	}
}

// ---------------------

export class PerspectiveCamera extends Camera {
	private width: number;
	private height: number;
	private fov: number;
	private near: number;
	private far: number;

	constructor(
		width: number,
		height: number,
		fov: number = 45,
		near: number = 0.1,
		far: number = 1000
	) {
		super('perspective');

		this.width = width;
		this.height = height;
		this.fov = fov;
		this.near = near;
		this.far = far;

		this.updatePerspective();
	}

	public updatePerspective() {
		mat4.perspective(
			this.projectionMatrix,
			(this.fov / 180) * Math.PI,
			this.width / this.height,
			this.near,
			this.far
		);

		mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
	}

	public updateSize(width: number, height: number) {
		this.width = width;
		this.height = height;

		this.updatePerspective();
	}

	public updateFocus(near: number, far: number) {
		if (near) this.near = near;
		if (far) this.far = far;

		this.updatePerspective();
	}

	public updatefov(angle: number) {
		this.fov = angle;

		this.updatePerspective();
	}
}

// ---------------------

export class OrthoCamera extends Camera {
	private left: number;
	private right: number;
	private bottom: number;
	private top: number;
	private near: number;
	private far: number;

	constructor(
		left: number,
		right: number,
		bottom: number,
		top: number,
		near: number,
		far: number
	) {
		super('ortho');

		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;
		this.near = near;
		this.far = far;

		this.updatePerspective();
	}

	public updateSize(left: number, right: number, bottom: number, top: number) {
		this.left = left;
		this.right = right;
		this.bottom = bottom;
		this.top = top;

		this.updatePerspective();
	}

	public updateFocus(near: number, far: number) {
		if (near) this.near = near;
		if (far) this.far = far;

		this.updatePerspective();
	}

	public updatePerspective() {
		mat4.ortho(
			this.projectionMatrix,
			this.left,
			this.right,
			this.bottom,
			this.top,
			this.near,
			this.far
		);

		mat4.invert(this.projectionMatrixInverse, this.projectionMatrix);
	}
}
