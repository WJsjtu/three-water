import * as THREE from 'three';

const calculateCounts = (w, h, d) => {
	let vertices = 0, index = 0;
	vertices += (w + 1) * (h + 1) * 2; // xy
	index += w * h * 2; // xy
	// y dir only one face
	vertices += (w + 1) * (d + 1); // xz
	index += w * d; // xz
	vertices += (w + 1) * (d + 1) * 2; // xz
	index += w * d * 2; // xz
	index *= 6; // two triangles per square => six vertices per square
	return [vertices, index];
};

export default class OpenBoxBufferGeometry extends THREE.BufferGeometry {
	constructor(width, height, depth, widthSegments, heightSegments, depthSegments) {
		super();
		this.parameters = {
			width,
			height,
			depth,
			widthSegments,
			heightSegments,
			depthSegments
		};


		// segments
		widthSegments = Math.floor(widthSegments) || 1;
		heightSegments = Math.floor(heightSegments) || 1;
		depthSegments = Math.floor(depthSegments) || 1;

		// these are used to calculate buffer length
		const counts = calculateCounts(widthSegments, heightSegments, depthSegments);
		let vertexCount = counts[0];
		let indexCount = counts[1];

		// buffers
		const indices = new ( indexCount > 65535 ? Uint32Array : Uint16Array )(indexCount);
		const vertices = new Float32Array(vertexCount * 3);
		const normals = new Float32Array(vertexCount * 3);
		const uvs = new Float32Array(vertexCount * 2);

		// offset variables
		let vertexBufferOffset = 0;
		let uvBufferOffset = 0;
		let indexBufferOffset = 0;
		let numberOfVertices = 0;

		// group variables
		let groupStart = 0;

		const buildPlane = (u, v, w, uDir, vDir, width, height, depth, gridX, gridY, materialIndex) => {

			const segmentWidth = width / gridX, segmentHeight = height / gridY;

			const widthHalf = width / 2, heightHalf = height / 2, depthHalf = depth / 2;

			const gridX1 = gridX + 1, gridY1 = gridY + 1;

			let vertexCounter = 0, groupCount = 0;

			const vector = new THREE.Vector3();

			// generate vertices, normals and uvs

			for (let iy = 0; iy < gridY1; iy++) {

				const y = iy * segmentHeight - heightHalf;

				for (let ix = 0; ix < gridX1; ix++) {

					const x = ix * segmentWidth - widthHalf;

					// set values to correct vector component
					vector[u] = x * uDir;
					vector[v] = y * vDir;
					vector[w] = depthHalf;

					// now apply vector to vertex buffer
					vertices[vertexBufferOffset] = vector.x;
					vertices[vertexBufferOffset + 1] = vector.y;
					vertices[vertexBufferOffset + 2] = vector.z;

					// set values to correct vector component
					vector[u] = 0;
					vector[v] = 0;
					vector[w] = depth > 0 ? 1 : -1;

					// now apply vector to normal buffer
					normals[vertexBufferOffset] = vector.x;
					normals[vertexBufferOffset + 1] = vector.y;
					normals[vertexBufferOffset + 2] = vector.z;

					// uvs
					uvs[uvBufferOffset] = ix / gridX;
					uvs[uvBufferOffset + 1] = 1 - ( iy / gridY );

					// update offsets and counters
					vertexBufferOffset += 3;
					uvBufferOffset += 2;
					vertexCounter += 1;

				}

			}

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for (let iy = 0; iy < gridY; iy++) {

				for (let ix = 0; ix < gridX; ix++) {

					// indices
					const a = numberOfVertices + ix + gridX1 * iy;
					const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
					const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
					const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

					// face one
					indices[indexBufferOffset] = a;
					indices[indexBufferOffset + 1] = b;
					indices[indexBufferOffset + 2] = d;

					// face two
					indices[indexBufferOffset + 3] = b;
					indices[indexBufferOffset + 4] = c;
					indices[indexBufferOffset + 5] = d;

					// update offsets and counters
					indexBufferOffset += 6;
					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support
			this.addGroup(groupStart, groupCount, materialIndex);

			// calculate new start value for groups
			groupStart += groupCount;

			// update total number of vertices
			numberOfVertices += vertexCounter;

		};

		// build each side of the box geometry
		buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0); // px

		buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1); // nx

		buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3); // ny

		buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4); // pz

		buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

		// build geometry
		this.setIndex(new THREE.BufferAttribute(indices, 1));
		this.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
		this.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
		this.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

	}
}

THREE.OpenBoxBufferGeometry = OpenBoxBufferGeometry;