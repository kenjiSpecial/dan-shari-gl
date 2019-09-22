export declare class TexturePools {
    private static instance;
    textures: {
        [key: string]: WebGLTexture;
    };
    private gl;
    private constructor();
    static GET_INSTANCE(): TexturePools;
    static GET_TEXTURE(name: string): WebGLTexture;
    setGL(gl: WebGLRenderingContext): void;
    setImage(name: string, element: HTMLImageElement | HTMLCanvasElement): void;
    private createEmptyCanvas;
}
