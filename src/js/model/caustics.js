import * as THREE from 'three';
import BufferShader from '../utils/BufferShader';
import causticsShader from '../shader/causticsShader';

export default class Caustics {
	constructor(renderer, width, height, debug = false) {

		this.renderer = renderer;

		this.targetOut = new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.debug = debug;

		if (this.debug === true) {
			this.scene = new THREE.Scene();
			this.finalMaterial = new THREE.MeshBasicMaterial({map: null});
			this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height, width, height), this.finalMaterial);
			this.scene.add(this.quad);
		}

		this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0, 1);
		causticsShader.uniforms.u_WaterWidth = width;
		causticsShader.uniforms.u_WaterHeight = height;
		this.pCaustics = new BufferShader(causticsShader, width, height, true);
		this.pCaustics.bufferMaterial.extensions.derivatives = true;
	}

	render(waterInfoTexture) {
		this.pCaustics.updateUniform('u_WaterInfoTexture', waterInfoTexture);
		this.pCaustics.regularRender(this.renderer, this.camera, this.targetOut);
		if (this.debug === true) {
			this.quad.material.map = this.targetOut.texture;
			this.renderer.render(this.scene, this.camera);
		}
		return this.targetOut.texture;
	}
}