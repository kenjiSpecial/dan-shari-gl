export declare class FBO {
    private gl;
    private width;
    private height;
    private buffer;
    private texture;
    private depth?;
    constructor(gl: WebGLRenderingContext, width: number, height: number, texture?: WebGLTexture, isDepthNeed?: boolean);
    createDepth(): void;
    bind(): void;
    unbind(): void;
}
