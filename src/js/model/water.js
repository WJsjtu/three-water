import * as THREE from 'three';
import BufferShader from '../utils/BufferShader';
import WaterInfoShader from '../shader/waterInfoShader';

export default class Water {
	constructor(renderer, width, height, debug = false) {
		this.renderer = renderer;


		this.debug = debug;

		const targetOptions = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			type: THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false
		};

		this.targetIn = new THREE.WebGLRenderTarget(width, height, targetOptions);
		this.targetOut = new THREE.WebGLRenderTarget(width, height, targetOptions);

		// debug, display the texture
		if (this.debug === true) {
			this.scene = new THREE.Scene();
			this.finalMaterial = new THREE.MeshBasicMaterial({map: null});
			this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height, 1, 1), this.finalMaterial);
			this.scene.add(this.quad);

		}

		this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0, 1);
		this.delta = new THREE.Vector2(1 / width, 1 / height);

		this.pDrop = new BufferShader(WaterInfoShader.dropShader, width, height);
		WaterInfoShader.stepShader.uniforms.u_Delta.value = this.delta;
		this.pStep = new BufferShader(WaterInfoShader.stepShader, width, height);
		WaterInfoShader.normalShader.uniforms.u_Delta.value = this.delta;
		this.pNormal = new BufferShader(WaterInfoShader.normalShader, width, height);
	}

	// render once
	render() {

		this.swapTargets();

		this.pStep.render(this.renderer, this.camera, this.targetIn, this.targetOut, 'u_Texture');

		this.swapTargets();

		this.pNormal.render(this.renderer, this.camera, this.targetIn, this.targetOut, 'u_Texture');

		if (this.debug === true) {
			this.quad.material.map = this.targetOut.texture;
			this.renderer.render(this.scene, this.camera);
		}

		return this.targetOut.texture;
	}

	swapTargets() {
		let t = this.targetIn;
		this.targetIn = this.targetOut;
		this.targetOut = t;
	}

	addDrop(dropCenter, dropRadius, dropStrength) {
		this.pDrop.updateUniform('u_Center', dropCenter);
		this.pDrop.updateUniform('u_Radius', dropRadius);
		this.pDrop.updateUniform('u_Strength', dropStrength);
		this.pDrop.render(this.renderer, this.camera, this.targetIn, this.targetOut, 'u_Texture');
		this.swapTargets();
	}
}