import {
	createImageTexture,
	createEmptyTexture,
	updateEmptyImageTexture
} from '../utils/functions/gl-textures';
export class FBO {
	private gl: WebGLRenderingContext;
	private width: number;
	private height: number;
	private buffer: WebGLFramebuffer | null;
	private texture: WebGLTexture | null;
	private depth?: WebGLRenderbuffer | null;

	constructor(
		gl: WebGLRenderingContext,
		width: number,
		height: number,
		texture?: WebGLTexture | null,
		isDepthNeed: boolean = false
	) {
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.texture =
			texture === undefined || texture === null
				? createEmptyTexture(this.gl, width, height)
				: texture;

		this.buffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
		this.bindTex();

		if (isDepthNeed) {
			this.createDepth();
			this.updateDepth();
		}
	}

	private bindTex() {
		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			this.texture,
			0
		);
	}

	private createDepth() {
		this.depth = this.gl.createRenderbuffer();
	}

	private updateDepth() {
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.depth as WebGLRenderbuffer);
		this.gl.renderbufferStorage(
			this.gl.RENDERBUFFER,
			this.gl.DEPTH_COMPONENT16,
			this.width,
			this.height
		);
		this.gl.framebufferRenderbuffer(
			this.gl.FRAMEBUFFER,
			this.gl.DEPTH_ATTACHMENT,
			this.gl.RENDERBUFFER,
			this.depth as WebGLRenderbuffer
		);
	}

	public bind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
	}

	public unbind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	}

	public resize(width: number, height: number, texture?: WebGLTexture) {
		this.width = width;
		this.height = height;

		this.bind();

		updateEmptyImageTexture(this.gl, this.texture as WebGLTexture, width, height);
		this.bindTex();
		this.updateDepth();
	}

	public getTexture() {
		return this.texture;
	}
}
