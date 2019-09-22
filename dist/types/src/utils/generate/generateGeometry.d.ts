export declare function getSphere(radius?: number, latitudeBands?: number, longitudeBands?: number): {
    vertices: number[];
    uvs: number[];
    normals: number[];
    indices: number[];
};
export declare function getPlane(width: number, height: number, widthSegment: number, heightSegment: number): {
    vertices: number[];
    uvs: number[];
    indices: number[];
};
export declare function mergeGeomtory(geometries: {
    vertices: number[];
    indices: number[];
    normals: number[];
    uvs: number[];
}[]): {
    vertices: number[];
    normals: number[];
    uvs: number[];
    indices: number[];
};
