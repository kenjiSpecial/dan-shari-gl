import { Camera } from '../camera/camera';
import { vec3 } from 'gl-matrix';
import { clamp } from '../math/math';

class DampedAction {
	private value: number = 0.0;
	private damping: number;
	constructor() {
		this.damping = 0.85;
	}

	addForce(force: number) {
		this.value += force;
	}

	/** updates the damping and calls {@link damped-callback}. */
	update() {
		let isActive = this.value * this.value > 0.000001;
		if (isActive) {
			this.value *= this.damping;
		} else {
			this.stop();
		}
		return this.value;
	}

	/** stops the damping. */
	stop() {
		this.value = 0.0;
	}
}

export class CameraController {
	private camera: Camera;
	private domElement: HTMLElement;
	private target: vec3 = vec3.create();
	private minDistance: number = 0;
	private maxDistance: number = Infinity;
	private isEnabled: boolean = true;
	private isDamping: boolean;
	private dampingFactor: number;
	private isZoom: boolean;
	private zoomSpeed: number;
	private isRotate: boolean;
	private rotateSpeed: number;
	private isPan: boolean;
	private keyPanSpeed: number;
	private enableKeys: boolean;
	private keys: {
		LEFT: string;
		UP: string;
		RIGHT: string;
		BOTTOM: string;
		SHIFT: string;
	};
	private originTarget: vec3;
	private originPosition: vec3;
	private targetXDampedAction: DampedAction = new DampedAction();
	private targetYDampedAction: DampedAction = new DampedAction();
	private targetZDampedAction: DampedAction = new DampedAction();
	private targetThetaDampedAction: DampedAction = new DampedAction();
	private targetPhiDampedAction: DampedAction = new DampedAction();
	private targetRadiusDampedAction: DampedAction = new DampedAction();
	private _isShiftDown = false;
	private _rotateStart = {
		x: 9999,
		y: 9999
	};
	private _rotateEnd = {
		x: 9999,
		y: 9999
	};
	private _roatteDelta = {
		x: 9999,
		y: 9999
	};
	private _spherical: {
		radius: number;
		theta: number;
		phi: number;
	};
	private _zoomDistanceEnd: number = 0;
	private _zoomDistance: number = 0;
	private state: string = '';
	private loopId: number = 0;
	private _panStart = { x: 0, y: 0 };
	private _panDelta = { x: 0, y: 0 };
	private _panEnd = { x: 0, y: 0 };
	constructor(camera: Camera, domElement = document.body) {
		if (!camera) {
			console.error('camera is undefined');
		}
		this.camera = camera;
		this.domElement = domElement;

		// Set to true to enable damping (inertia)
		// If damping is enabled, you must call controls.update() in your animation loop
		this.isDamping = false;
		this.dampingFactor = 0.25;

		// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
		// Set to false to disable zooming
		this.isZoom = true;
		this.zoomSpeed = 1.0;

		// Set to false to disable rotating
		this.isRotate = true;
		this.rotateSpeed = 1.0;

		// Set to false to disable panning
		this.isPan = true;
		this.keyPanSpeed = 7.0; // pixels moved per arrow key push

		// Set to false to disable use of the keys
		this.enableKeys = true;

		// The four arrow keys
		this.keys = {
			LEFT: '37',
			UP: '38',
			RIGHT: '39',
			BOTTOM: '40',
			SHIFT: '16'
		};

		// for reset
		this.originTarget = vec3.create();
		this.originPosition = vec3.create();
		this.originPosition[0] = camera.position.x;
		this.originPosition[1] = camera.position.x;
		this.originPosition[2] = camera.position.x;

		let dX = this.camera.position.x;
		let dY = this.camera.position.y;
		let dZ = this.camera.position.z;
		let radius = Math.sqrt(dX * dX + dY * dY + dZ * dZ);
		let theta = Math.atan2(this.camera.position.x, this.camera.position.z); // equator angle around y-up axis
		let phi = Math.acos(clamp(this.camera.position.y / radius, -1, 1)); // polar angle
		this._spherical = {
			radius: radius,
			theta: theta,
			phi: phi
		};

		this._bindEvens();
		this.setEventHandler();
		this.startTick();
	}
	setEventHandler() {
		this.domElement.addEventListener('contextmenu', this._contextMenuHandler, false);
		this.domElement.addEventListener('mousedown', this._mouseDownHandler, false);
		this.domElement.addEventListener('wheel', this._mouseWheelHandler, false);

		this.domElement.addEventListener('touchstart', this._touchStartHandler, false);
		this.domElement.addEventListener('touchmove', this._touchMoveHandler, false);

		window.addEventListener('keydown', this._onKeyDownHandler, false);
		window.addEventListener('keyup', this._onKeyUpHandler, false);
	}
	removeEventHandler() {
		this.domElement.removeEventListener('contextmenu', this._contextMenuHandler, false);
		this.domElement.removeEventListener('mousedown', this._mouseDownHandler, false);
		this.domElement.removeEventListener('wheel', this._mouseWheelHandler, false);
		this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
		window.removeEventListener('mouseup', this._mouseUpHandler, false);

		this.domElement.removeEventListener('touchstart', this._touchStartHandler, false);
		this.domElement.removeEventListener('touchmove', this._touchMoveHandler, false);

		window.removeEventListener('keydown', this._onKeyDownHandler, false);
		window.removeEventListener('keydown', this._onKeyUpHandler, false);
	}
	startTick() {
		this.loopId = requestAnimationFrame(this.tick);
	}
	tick() {
		this.updateDampedAction();
		this.updateCamera();
		this.loopId = requestAnimationFrame(this.tick);
	}
	updateDampedAction() {
		this.target[0] += this.targetXDampedAction.update();
		this.target[1] += this.targetYDampedAction.update();
		this.target[2] += this.targetZDampedAction.update();

		this._spherical.theta += this.targetThetaDampedAction.update();
		this._spherical.phi += this.targetPhiDampedAction.update();
		this._spherical.radius += this.targetRadiusDampedAction.update();
	}
	updateCamera() {
		let s = this._spherical;
		let sinPhiRadius = Math.sin(s.phi) * s.radius;

		this.camera.position.x = sinPhiRadius * Math.sin(s.theta) + this.target[0];
		this.camera.position.y = Math.cos(s.phi) * s.radius + this.target[1];
		this.camera.position.z = sinPhiRadius * Math.cos(s.theta) + this.target[2];
		// console.log(this.camera.position);
		// console.log(this.target);

		this.camera.lookAtPosition.x = this.target[0];
		this.camera.lookAtPosition.y = this.target[1];
		this.camera.lookAtPosition.z = this.target[2];

		this.camera.updateViewMatrix();
	}
	_bindEvens() {
		this.tick = this.tick.bind(this);
		this._contextMenuHandler = this._contextMenuHandler.bind(this);
		this._mouseDownHandler = this._mouseDownHandler.bind(this);
		this._mouseWheelHandler = this._mouseWheelHandler.bind(this);
		this._mouseMoveHandler = this._mouseMoveHandler.bind(this);
		this._mouseUpHandler = this._mouseUpHandler.bind(this);

		this._touchStartHandler = this._touchStartHandler.bind(this);
		this._touchMoveHandler = this._touchMoveHandler.bind(this);

		this._onKeyDownHandler = this._onKeyDownHandler.bind(this);
		this._onKeyUpHandler = this._onKeyUpHandler.bind(this);
	}

	_contextMenuHandler(event: MouseEvent) {
		if (!this.isEnabled) return;

		event.preventDefault();
	}
	_mouseDownHandler(event: MouseEvent) {
		if (!this.isEnabled) return;

		if (event.button === 0) {
			this.state = 'rotate';
			this._rotateStart = {
				x: event.clientX,
				y: event.clientY
			};
		} else {
			this.state = 'pan';
			this._panStart = {
				x: event.clientX,
				y: event.clientY
			};
		}

		this.domElement.addEventListener('mousemove', this._mouseMoveHandler, false);
		window.addEventListener('mouseup', this._mouseUpHandler, false);
	}
	_mouseUpHandler() {
		this.domElement.removeEventListener('mousemove', this._mouseMoveHandler, false);
		window.removeEventListener('mouseup', this._mouseUpHandler, false);
	}
	_mouseMoveHandler(event: MouseEvent) {
		if (!this.isEnabled) return;

		if (this.state === 'rotate') {
			this._rotateEnd = {
				x: event.clientX,
				y: event.clientY
			};
			this._roatteDelta = {
				x: this._rotateEnd.x - this._rotateStart.x,
				y: this._rotateEnd.y - this._rotateStart.y
			};

			this._updateRotateHandler();

			this._rotateStart = {
				x: this._rotateEnd.x,
				y: this._rotateEnd.y
			};
		} else if (this.state === 'pan') {
			this._panEnd = {
				x: event.clientX,
				y: event.clientY
			};
			this._panDelta = {
				x: -0.5 * (this._panEnd.x - this._panStart.x),
				y: 0.5 * (this._panEnd.y - this._panStart.y)
			};

			this._updatePanHandler();
			this._panStart = {
				x: this._panEnd.x,
				y: this._panEnd.y
			};
		}
		// this.update();
	}
	_mouseWheelHandler(event: WheelEvent) {
		if (event.deltaY > 0) {
			this.targetRadiusDampedAction.addForce(1);
		} else {
			this.targetRadiusDampedAction.addForce(-1);
		}
	}

	_touchStartHandler(event: TouchEvent) {
		let dX: number;
		let dY: number;

		switch (event.touches.length) {
			case 1:
				this.state = 'rotate';
				this._rotateStart = {
					x: event.touches[0].clientX,
					y: event.touches[0].clientY
				};
				break;
			case 2:
				this.state = 'zoom';
				dX = event.touches[1].clientX - event.touches[0].clientX;
				dY = event.touches[1].clientY - event.touches[0].clientY;
				this._zoomDistance = Math.sqrt(dX * dX + dY * dY);
				break;
			case 3:
				this.state = 'pan';
				this._panStart = {
					x:
						(event.touches[0].clientX +
							event.touches[1].clientX +
							event.touches[2].clientX) /
						3,
					y:
						(event.touches[0].clientY +
							event.touches[1].clientY +
							event.touches[2].clientY) /
						3
				};

				break;
		}
	}

	_touchMoveHandler(event: TouchEvent) {
		let dX: number;
		let dY: number;
		let dDis: number;

		switch (event.touches.length) {
			case 1:
				if (this.state !== 'rotate') return;
				this._rotateEnd = {
					x: event.touches[0].clientX,
					y: event.touches[0].clientY
				};
				this._roatteDelta = {
					x: (this._rotateEnd.x - this._rotateStart.x) * 0.5,
					y: (this._rotateEnd.y - this._rotateStart.y) * 0.5
				};

				this._updateRotateHandler();

				this._rotateStart = {
					x: this._rotateEnd.x,
					y: this._rotateEnd.y
				};
				break;
			case 2:
				if (this.state !== 'zoom') return;
				dX = event.touches[1].clientX - event.touches[0].clientX;
				dY = event.touches[1].clientY - event.touches[0].clientY;
				this._zoomDistanceEnd = Math.sqrt(dX * dX + dY * dY);

				dDis = this._zoomDistanceEnd - this._zoomDistance;
				dDis *= 1.5;

				let targetRadius = this._spherical.radius - dDis;
				targetRadius = clamp(targetRadius, this.minDistance, this.maxDistance);
				this._zoomDistance = this._zoomDistanceEnd;
				this._spherical.radius = targetRadius;
				break;
			case 3:
				this._panEnd = {
					x:
						(event.touches[0].clientX +
							event.touches[1].clientX +
							event.touches[2].clientX) /
						3,
					y:
						(event.touches[0].clientY +
							event.touches[1].clientY +
							event.touches[2].clientY) /
						3
				};
				this._panDelta = {
					x: this._panEnd.x - this._panStart.x,
					y: this._panEnd.y - this._panStart.y
				};

				this._panDelta.x *= -1;

				this._updatePanHandler();
				this._panStart = {
					x: this._panEnd.x,
					y: this._panEnd.y
				};
				break;
		}

		// this.update();
	}

	_onKeyDownHandler(event: KeyboardEvent) {
		let dX = 0;
		let dY = 0;

		switch (event.key) {
			case this.keys.SHIFT:
				this._isShiftDown = true;
				break;
			case this.keys.LEFT:
				dX = -10;
				break;
			case this.keys.RIGHT:
				dX = 10;
				break;
			case this.keys.UP:
				dY = 10;
				break;
			case this.keys.BOTTOM:
				dY = -10;
				break;
		}

		if (!this._isShiftDown) {
			this._panDelta = {
				x: dX,
				y: dY
			};
			this._updatePanHandler();
		} else {
			this._roatteDelta = {
				x: -dX,
				y: dY
			};
			this._updateRotateHandler();
		}
	}
	_onKeyUpHandler(event: KeyboardEvent) {
		switch (event.key) {
			case this.keys.SHIFT:
				this._isShiftDown = false;
				break;
		}
	}
	_updatePanHandler() {
		let xDir = vec3.create();
		let yDir = vec3.create();
		let zDir = vec3.create();
		zDir[0] = this.target[0] - this.camera.position.x;
		zDir[1] = this.target[1] - this.camera.position.y;
		zDir[2] = this.target[2] - this.camera.position.z;
		vec3.normalize(zDir, zDir);

		vec3.cross(xDir, zDir, [0, 1, 0]);
		vec3.cross(yDir, xDir, zDir);

		const scale = Math.max(this._spherical.radius / 2000, 0.001);

		this.targetXDampedAction.addForce(
			(xDir[0] * this._panDelta.x + yDir[0] * this._panDelta.y) * scale
		);
		this.targetYDampedAction.addForce(
			(xDir[1] * this._panDelta.x + yDir[1] * this._panDelta.y) * scale
		);
		this.targetZDampedAction.addForce(
			(xDir[2] * this._panDelta.x + yDir[2] * this._panDelta.y) * scale
		);
	}
	_updateRotateHandler() {
		this.targetThetaDampedAction.addForce(-this._roatteDelta.x / this.domElement.clientWidth);
		this.targetPhiDampedAction.addForce(-this._roatteDelta.y / this.domElement.clientHeight);
	}
}
