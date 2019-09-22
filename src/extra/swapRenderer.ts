import { createProgram } from '../utils/functions/gl-functions';

import {
	createEmptyTexture,
	createImageTexture,
	createCustomTypeImageTexture
} from '../utils/functions/gl-textures';
import {
	RGB,
	LINEAR,
	CLAMP_TO_EDGE,
	UNIFORM_1F,
	UNIFORM_2F,
	UNIFORM_3F,
	UNIFORM_1I,
	UNIFORM_MAT_4F
} from '../utils/common/constants';
import { createSuperSimpleplane } from '../utils/generate/generateSimpleGeometry';

export class SwapRenderer {
	private gl: WebGLRenderingContext;

	private textures: {
		[key: string]: WebGLTexture | null;
	} = {};

	private framebuffers: {
		[key: string]: WebGLFramebuffer | null;
	} = {};

	private programs: {
		[key: string]: {
			id: WebGLProgram;
			uniforms: { [key: string]: WebGLUniformLocation | null };
		};
	} = {};

	private positionVbos: {
		[key: string]: WebGLBuffer | null;
	} = {};

	constructor(gl: WebGLRenderingContext) {
		this.gl = gl;
	}

	setSize(width: number, height: number) {
		this.gl.viewport(0, 0, width, height);
	}

	createProgram(programName: string, vertexShader: string, fragmentShader: string) {
		const program = createProgram(this.gl, vertexShader, fragmentShader);

		this.gl.useProgram(program);

		this.programs[programName] = {
			id: program,
			uniforms: {}
		};
	}

	initTexture(name: string, width: number, height: number, type: number) {
		const texture = createEmptyTexture(
			this.gl,
			width,
			height,
			RGB,
			LINEAR,
			LINEAR,
			CLAMP_TO_EDGE,
			CLAMP_TO_EDGE,
			type
		);

		this.textures[name] = texture;
	}

	initTextureWithImage(name: string, type: number, image: HTMLImageElement) {
		const texture = createCustomTypeImageTexture(this.gl, image, this.gl.RGB, type, true);

		this.textures[name] = texture;
	}

	initFramebufferForTexture(textureName: string) {
		const texture = this.textures[textureName];
		const framebuffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			texture,
			0
		);

		this.framebuffers[textureName] = framebuffer;
	}

	initDepthTexture(width: number, height: number) {
		const depth = this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depth);
		this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
	}

	use(programName: string) {
		this.gl.useProgram(this.programs[programName].id);
	}

	getProgram(programName: string) {
		return this.programs[programName].id;
	}

	createPositionVBO(name: string, scaleX: number = 1, scaleY: number = 1) {
		const buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER,
			createSuperSimpleplane(scaleX, scaleY),
			this.gl.STATIC_DRAW
		);

		this.positionVbos[name] = buffer;
	}

	usePositionVBO() {
		const location = 0;
		this.gl.enableVertexAttribArray(location);
		this.gl.vertexAttribPointer(location, 2, this.gl.FLOAT, false, 0, 0);
	}

	updateVBO(name: string) {
		const buffer = this.positionVbos[name];
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.usePositionVBO();
	}

	run(programName: string, inputNameArr: string[], outputName: string) {
		this.use(programName);
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffers[outputName]);
		for (let ii = 0; ii < inputNameArr.length; ii = ii + 1) {
			const inputName = inputNameArr[ii];
			this.gl.activeTexture(this.gl.TEXTURE0 + ii);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[inputName]);
		}

		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
	}

	swapTextures(texture1Name: string, texture2Name: string) {
		let tempTex = this.textures[texture1Name];
		this.textures[texture1Name] = this.textures[texture2Name];
		this.textures[texture2Name] = tempTex;

		const tempFBO = this.framebuffers[texture1Name];
		this.framebuffers[texture1Name] = this.framebuffers[texture2Name];
		this.framebuffers[texture2Name] = tempFBO;
	}

	setUniform(
		programName: string,
		name: string,
		val: number | number[] | Float32List,
		type: string
	) {
		let uniforms = this.programs[programName].uniforms;
		// console.log(this.programs[programName].uniforms);
		let location = uniforms[name];
		if (!location) {
			location = this.gl.getUniformLocation(this.programs[programName].id, name);
			uniforms[name] = location;

			if (!location) {
				console.warn({ programName, name });
			}
		}

		if (type === UNIFORM_1F) this.gl.uniform1f(location, val as number);
		else if (type === UNIFORM_2F) {
			val = val as number[];
			this.gl.uniform2f(location, val[0], val[1]);
		} else if (type === UNIFORM_3F) {
			val = val as number[];
			this.gl.uniform3f(location, val[0], val[1], val[2]);
		} else if (type === UNIFORM_1I) {
			this.gl.uniform1i(location, val as number);
		} else if (type === UNIFORM_MAT_4F) {
			this.gl.uniformMatrix4fv(location, false, val as Float32List);
		} else {
			console.warn('no uniform for type ' + type);
		}
	}

	reset() {
		this.programs = {};
		this.framebuffers = {};
		this.textures = {};
		this.positionVbos = {};
	}
}
