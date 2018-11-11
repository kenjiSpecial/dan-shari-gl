import { mat4 } from '../math';

export class Camera {
	constructor(width, height, fov = 45, near = 0.1, far = 1000) {
		this.position = { x: 0, y: 0, z: 0 };
		this.lookAtPosition = { x: 0, y: 0, z: 0 };

		this._viewMatrix = mat4.create();
		this._projectionMatrix = mat4.create();

		this.updatePerspective(width, height, fov, near, far);
	}

	updatePerspective(width, height, fov, near, far) {
		mat4.perspective(this._projectionMatrix, (fov / 180) * Math.PI, width / height, near, far);
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
			this._viewMatrix,
			[this.position.x, this.position.y, this.position.z],
			[this.lookAtPosition.x, this.lookAtPosition.y, this.lookAtPosition.z],
			[0, 1, 0]
		);
	}

	get viewMatrix() {
		return this._viewMatrix;
	}

	get projectionMatrix() {
		return this._projectionMatrix;
	}
}
