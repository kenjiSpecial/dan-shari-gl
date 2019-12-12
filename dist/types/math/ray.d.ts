import { vec3, mat4 } from 'gl-matrix';
import { Box } from '../interfaces/interface';
export declare class Ray {
    private isPrev;
    private orig;
    private dir;
    private worldMatrix3Inv;
    intersect(box: Box): false | {
        tmin: number;
        tmax: number;
    };
    rayCast(faces: [vec3, vec3, vec3][], worldMatrixInv: mat4): {
        t: number;
        pt: number[];
    } | undefined;
    intersectFaces(faces: [vec3, vec3, vec3][], dir: vec3, orig: vec3): {
        t: number;
        pt: number[];
    } | undefined;
    intersectPts(pt0: vec3, pt1: vec3, pt2: vec3, dir: vec3, orig: vec3): false | {
        t: number;
        pt: number[];
    };
    calcDirection(startPt: vec3, endPt: vec3): void;
    swap(valA: number, valB: number): {
        minVal: number;
        maxVal: number;
    };
    dot(a: vec3, b: vec3): number;
}
