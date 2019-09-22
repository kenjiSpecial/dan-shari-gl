export declare class FBO {
    private gl;
    private width;
    private height;
    private buffer;
    private texture;
    private depth?;
    constructor(gl: WebGLRenderingContext, width: number, height: number, texture?: WebGLTexture | null, isDepthNeed?: boolean);
    private bindTex;
    private createDepth;
    private updateDepth;
    bind(): void;
    unbind(): void;
    resize(width: number, height: number, texture?: WebGLTexture): void;
    getTexture(): WebGLTexture | null;
}
