import { createImageTexture } from '../utils/functions/gl-textures';
import { EMPTY_CANVAS_SIZE, EMPTY_CANVAS_COLOR, COLOR_REPEAT } from '../utils/common/constants';

export class TexturePools {
	private static instance: TexturePools;
	public textures: { [key: string]: WebGLTexture } = {};
	private gl!: WebGLRenderingContext;
	private constructor() {}

	public static GET_INSTANCE() {
		if (!TexturePools.instance) {
			TexturePools.instance = new TexturePools();
			// ... any one time initialization goes here ...
		}

		return TexturePools.instance;
	}

	public static GET_TEXTURE(name: string) {
		return TexturePools.instance.textures[name];
	}

	public setGL(gl: WebGLRenderingContext) {
		this.gl = gl;
		this.setImage('empty', this.createEmptyCanvas());
	}

	public setImage(name: string, element: HTMLImageElement | HTMLCanvasElement) {
		const texture = createImageTexture(this.gl, element) as WebGLTexture;
		this.textures[name] = texture;
	}

	private createEmptyCanvas() {
		const canvas = document.createElement('canvas');
		canvas.width = EMPTY_CANVAS_SIZE;
		canvas.height = EMPTY_CANVAS_SIZE;
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, EMPTY_CANVAS_SIZE, EMPTY_CANVAS_SIZE);
		ctx.fillStyle = EMPTY_CANVAS_COLOR;
		let cnt = 0;
		const unitWidthSize = EMPTY_CANVAS_SIZE / COLOR_REPEAT;
		for (let xx = 0; xx < COLOR_REPEAT; xx = xx + 1) {
			for (let yy = 0; yy < COLOR_REPEAT; yy = yy + 1) {
				if (cnt % 2 === 0) {
					const xpos = xx * unitWidthSize;
					const ypos = yy * unitWidthSize;
					ctx.fillRect(xpos, ypos, unitWidthSize, unitWidthSize);
				}
				cnt = cnt + 1;
			}
		}

		return canvas;
	}
}
