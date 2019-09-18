import { createImageTexture, createEmptyTexture } from '../utils/functions/gl-textures';
export class FBO {
	private gl: WebGLRenderingContext;
	private width: number;
	private height: number;
	private buffer: WebGLFramebuffer | null;
	private texture: WebGLTexture | null;
	private depth?: WebGLRenderingContextBase | null;

	constructor(
		gl: WebGLRenderingContext,
		width: number,
		height: number,
		texture?: WebGLTexture,
		isDepthNeed: boolean = false
	) {
		this.gl = gl;
		this.width = width;
		this.height = height;
		this.texture = texture === undefined ? createEmptyTexture(this.gl, width, height) : texture;

		this.buffer = this.gl.createFramebuffer();
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);

		this.gl.framebufferTexture2D(
			this.gl.FRAMEBUFFER,
			this.gl.COLOR_ATTACHMENT0,
			this.gl.TEXTURE_2D,
			this.texture,
			0
		);

		if (isDepthNeed) {
			this.createDepth();
		}
	}

	public createDepth() {
		const depth = this.gl.createRenderbuffer();
		this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depth);
		this.gl.renderbufferStorage(
			this.gl.RENDERBUFFER,
			this.gl.DEPTH_COMPONENT16,
			this.width,
			this.height
		);
	}

	public bind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
	}

	public unbind() {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	}
}
