import { mat4 } from '../math';

export class Camera {
	constructor(type = 'camera') {
		this.type = type;
		this.position = { x: 0, y: 0, z: 0 };
		this.lookAtPosition = { x: 0, y: 0, z: 0 };

		this.viewMatrix = mat4.create();
		this.projectionMatrix = mat4.create();
	}

	updatePosition(xx = 0, yy = 0, zz = 0) {
		this.position.x = xx;
		this.position.y = yy;
		this.position.z = zz;
	}

	updateLookAtPosition(xx = 0, yy = 0, zz = -100) {
		this.lookAtPosition.x = xx;
		this.lookAtPosition.y = yy;
		this.lookAtPosition.z = zz;
	}

	updateViewMatrix() {
		mat4.lookAt(
			this.viewMatrix,
			[this.position.x, this.position.y, this.position.z],
			[this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z],
			[0, 1, 0]
		);
	}
}

export class PerspectiveCamera extends Camera {
	constructor(width, height, fov = 45, near = 0.1, far = 1000) {
		super('perspective');
		this.updatePerspective(width, height, fov, near, far);
	}

	updatePerspective(width, height, fov, near, far) {
		this.aspect = width / height;
		this.fov = fov;
		this.near = near;
		this.far = far;
		this.fov = fov;

		const angle = (this.fov / 180) * Math.PI;

		mat4.perspective(this.projectionMatrix, angle, this.aspect, this.near, this.far);
	}

	/**
	 *
	 * @param {number} width width of gl context
	 * @param {number} height height of gl context
	 */
	updateAspect(width, height) {
		this.aspect = width / height;
		const angle = (this.fov / 180) * Math.PI;
		
		mat4.perspective(this.projectionMatrix, angle, this.aspect, this.near, this.far);
	}
}

export class OrthoCamera extends Camera {
	constructor(left, right, bottom, top, near, far) {
		super('ortho');
		this.updatePerspective(left, right, bottom, top, near, far);
	}

	updatePerspective(left, right, bottom, top, near, far) {
		mat4.ortho(this.projectionMatrix, left, right, bottom, top, near, far);
	}
}
