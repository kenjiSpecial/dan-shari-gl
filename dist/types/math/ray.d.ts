import { vec3 } from 'gl-matrix';
import { Box } from '../interfaces/interface';
export declare class Ray {
    private isPrev;
    private dir;
    private orig;
    private origVec;
    private dirVec;
    intersect(box: Box): false | {
        tmin: number;
        tmax: number;
    };
    intersectFaces(faces: [vec3, vec3, vec3][]): {
        t: number;
        pt: number[];
    } | undefined;
    intersectPts(pt0: vec3, pt1: vec3, pt2: vec3): false | {
        t: number;
        pt: number[];
    };
    rayFromPts(startPt: vec3, endPt: vec3): void;
    swap(valA: number, valB: number): {
        minVal: number;
        maxVal: number;
    };
    dot(a: vec3, b: vec3): number;
}
