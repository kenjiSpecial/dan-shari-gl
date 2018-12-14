import { vec3 } from './gl-matrix/vec3';

export class Ray {
	constructor() {}

	setFroCamera() {}

	intersect(box) {
		let { min, max } = box;

		let tmin = (min.x - this.orig.x) / this.dir.x;
		let tmax = (max.x - this.orig.x) / this.dir.x;

		let minY = tmin * this.dir.y + this.orig.y;
		let maxY = tmax * this.dir.y + this.orig.y;

		if (minY > maxY) {
			let { minVal, maxVal } = this.swap(minY, maxY);
			minY = minVal;
			maxY = maxVal;
		}
		if (minY > max.y || maxY < min.y) {
			return false;
		}

		let minZ = tmin * this.dir.z + this.orig.z;
		let maxZ = tmax * this.dir.z + this.orig.z;

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

	intersectFaces(faces) {
		// let intersectFaceArr = [];
		let intersectFace;
		for (let ii = 0; ii < faces.length; ii++) {
			let pts = faces[ii];
			let intersect = this.intersectPts(pts[0], pts[1], pts[2]);
			if (intersect) {
				if (!intersectFace || intersectFace.t > intersect.t) intersectFace = intersect;
			}
		}

		return intersectFace;
	}

	// https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/ray-triangle-intersection-geometric-solution
    // https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
    
	intersectPts(pt0, pt1, pt2) {
		let dir0Vec = vec3.create();
		let dir1Vec = vec3.create();
		let nVec = vec3.create();

		vec3.subtract(dir0Vec, pt1, pt0);
		vec3.subtract(dir1Vec, pt2, pt0);
		vec3.cross(nVec, dir0Vec, dir1Vec);
		let D = -this.dot(nVec, pt0);

		if (Math.abs(this.dot(this.dir, nVec)) < Number.EPSILON) return false;

		let t = -(this.dot(nVec, this.origVec) + D) / this.dot(nVec, this.dirVec);
		let intersectPt = [
			this.dirVec[0] * t + this.origVec[0],
			this.dirVec[1] * t + this.origVec[1],
			this.dirVec[2] * t + this.origVec[2]
		];

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

	rayFromPts(startPt, endPt) {
		let dir = vec3.create();
		vec3.subtract(dir, endPt, startPt);
		vec3.normalize(dir, dir);
		this.dir = { x: dir[0], y: dir[1], z: dir[2] };
		this.dirVec = dir;
		this.orig = { x: startPt[0], y: startPt[1], z: startPt[2] };
		this.origVec = startPt;
	}

	rayFromCamera() {}

	swap(valA, valB) {
		let tempVal = valA;
		valA = valB;
		valB = tempVal;

		return { minVal: valA, maxVal: valB };
	}

	dot(a, b) {
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	}
}
