export class TextRendering {
	public vertices: Float32Array;
	public uvs: Float32Array;
	public indices: Uint16Array;
	constructor(gl: WebGLRenderingContext, textLayout: any, bitmapImage: any) {
		const vertices: number[] = [];
		const uvs: number[] = [];
		const indices: number[] = [];

		let imageWidth = bitmapImage.width;
		let imageHeight = bitmapImage.height;

		textLayout.glyphs.forEach((glyph: any, index: any) => {
			let bitmap = glyph.data;
			let [xx, yy] = glyph.position;

			let startX = xx + bitmap.xoffset - textLayout.width / 2;
			let endX = startX + bitmap.width;
			let startY = -1 * (yy + bitmap.yoffset + textLayout.height / 2);
			let endY = startY - bitmap.height;

			let startUVX = bitmap.x / imageWidth;
			let endUVX = startUVX + bitmap.width / imageWidth;
			let startUVY = 1 - bitmap.y / imageHeight;
			let endUVY = 1 - (bitmap.y + bitmap.height) / imageHeight;

			vertices.push(startX, startY, endX, startY, endX, endY, startX, endY);
			uvs.push(startUVX, startUVY, endUVX, startUVY, endUVX, endUVY, startUVX, endUVY);
			let lastIndex = 4 * index;
			indices.push(
				0 + lastIndex,
				2 + lastIndex,
				1 + lastIndex,
				0 + lastIndex,
				3 + lastIndex,
				2 + lastIndex
			);
		});

		this.vertices = new Float32Array(vertices);
		this.uvs = new Float32Array(uvs);
		this.indices = new Uint16Array(indices);
	}
}
