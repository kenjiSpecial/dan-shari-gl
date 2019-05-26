import { vec3, mat4, mat3 } from 'gl-matrix';
import { Box, Vector3 } from '../interfaces/interface';

export class Ray {
	private isPrev: boolean = false;
	private orig: vec3 = vec3.create();
	private dir: vec3 = vec3.create();
	private worldMatrix3Inv: mat3 = mat3.create();

	intersect(box: Box) {
		let { min, max } = box;

		let tmin = (min.x - this.orig[0]) / this.dir[0];
		let tmax = (max.x - this.orig[0]) / this.dir[0];

		let minY = tmin * this.dir[1] + this.orig[1];
		let maxY = tmax * this.dir[1] + this.orig[1];

		if (minY > maxY) {
			let { minVal, maxVal } = this.swap(minY, maxY);
			minY = minVal;
			maxY = maxVal;
		}
		if (minY > max.y || maxY < min.y) {
			return false;
		}

		let minZ = tmin * this.dir[2] + this.orig[2];
		let maxZ = tmax * this.dir[2] + this.orig[2];

		if (minZ > maxZ) {
			let { minVal, maxVal } = this.swap(minZ, maxZ);
			minZ = minVal;
			maxZ = maxVal;
		}

		if (minZ > max.z || maxZ < min.z) {
			return false;
		}

		this.isPrev = true;

		return { tmin, tmax };
	}

	rayCast(faces: [vec3, vec3, vec3][], worldMatrixInv: mat4) {
		const transDir = vec3.create();
		const transOrig = vec3.create();

		mat3.fromMat4(this.worldMatrix3Inv, worldMatrixInv);
		vec3.transformMat3(transDir, this.dir, this.worldMatrix3Inv);
		vec3.normalize(transDir, transDir);
		vec3.transformMat4(transOrig, this.orig, worldMatrixInv);

		return this.intersectFaces(faces, transDir, transOrig);
	}

	intersectFaces(faces: [vec3, vec3, vec3][], dir: vec3, orig: vec3) {
		let intersectFace;
		for (let ii = 0; ii < faces.length; ii++) {
			let pts = faces[ii];
			let intersect = this.intersectPts(pts[0], pts[1], pts[2], dir, orig);
			if (intersect) {
				if (!intersectFace || intersectFace.t > intersect.t) intersectFace = intersect;
			}
		}

		return intersectFace;
	}

	// https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d

	intersectPts(pt0: vec3, pt1: vec3, pt2: vec3, dir: vec3, orig: vec3) {
		let dir0Vec = vec3.create();
		let dir1Vec = vec3.create();
		let nVec = vec3.create();

		vec3.subtract(dir0Vec, pt1, pt0);
		vec3.subtract(dir1Vec, pt2, pt0);
		vec3.cross(nVec, dir0Vec, dir1Vec);
		let D = -this.dot(nVec, pt0);

		if (Math.abs(this.dot(dir, nVec)) < Number.EPSILON) return false;

		let t = -(this.dot(nVec, orig) + D) / this.dot(nVec, dir);
		let intersectPt = [dir[0] * t + orig[0], dir[1] * t + orig[1], dir[2] * t + orig[2]];

		let dir0 = [pt1[0] - pt0[0], pt1[1] - pt0[1], pt1[2] - pt0[2]];
		let intersectPt0 = [
			intersectPt[0] - pt0[0],
			intersectPt[1] - pt0[1],
			intersectPt[2] - pt0[2]
		];
		let dotProduct0Vec = vec3.create();
		vec3.cross(dotProduct0Vec, dir0, intersectPt0);
		let judge0 = this.dot(dotProduct0Vec, nVec);
		if (judge0 < 0) return false;

		let dir1 = [pt2[0] - pt1[0], pt2[1] - pt1[1], pt2[2] - pt1[2]];
		let intersectPt1 = [
			intersectPt[0] - pt1[0],
			intersectPt[1] - pt1[1],
			intersectPt[2] - pt1[2]
		];
		let dotProduct1Vec = vec3.create();
		vec3.cross(dotProduct1Vec, dir1, intersectPt1);
		let judge1 = this.dot(dotProduct1Vec, nVec);
		if (judge1 < 0) return false;

		let dir2 = [pt0[0] - pt2[0], pt0[1] - pt2[1], pt0[2] - pt2[2]];
		let intersectPt2 = [
			intersectPt[0] - pt2[0],
			intersectPt[1] - pt2[1],
			intersectPt[2] - pt2[2]
		];
		let dotProduct2Vec = vec3.create();
		vec3.cross(dotProduct2Vec, dir2, intersectPt2);
		let judge2 = this.dot(dotProduct2Vec, nVec);
		if (judge2 < 0) return false;

		return { t: t, pt: intersectPt };
	}

	calcDirection(startPt: vec3, endPt: vec3) {
		let dir = vec3.create();
		vec3.subtract(dir, endPt, startPt);
		vec3.normalize(dir, dir);
		this.dir = dir;
		this.orig = startPt;
	}

	swap(valA: number, valB: number) {
		let tempVal = valA;
		valA = valB;
		valB = tempVal;

		return { minVal: valA, maxVal: valB };
	}

	dot(a: vec3, b: vec3) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}
}
