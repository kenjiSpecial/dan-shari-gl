export declare class SwapRenderer {
    private gl;
    private textures;
    private framebuffers;
    private programs;
    private positionVbos;
    constructor(gl: WebGLRenderingContext);
    setSize(width: number, height: number): void;
    createProgram(programName: string, vertexShader: string, fragmentShader: string): void;
    initTexture(name: string, width: number, height: number, type: number): void;
    initTextureWithImage(name: string, type: number, image: HTMLImageElement): void;
    initFramebufferForTexture(textureName: string): void;
    initDepthTexture(width: number, height: number): void;
    use(programName: string): void;
    getProgram(programName: string): WebGLProgram;
    createPositionVBO(name: string, scaleX?: number, scaleY?: number): void;
    usePositionVBO(): void;
    updateVBO(name: string): void;
    run(programName: string, inputNameArr: string[], outputName: string): void;
    swapTextures(texture1Name: string, texture2Name: string): void;
    setUniform(programName: string, name: string, val: number | number[] | Float32List, type: string): void;
    reset(): void;
}
