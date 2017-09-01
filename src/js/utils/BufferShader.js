import * as THREE from 'three';

export default class BufferShader {
	constructor(shader, width, height, useGrid = false) {
		this.bufferScene = new THREE.Scene();
		this.bufferMaterial = new THREE.ShaderMaterial(shader);
		this.bufferScene.add(new THREE.Mesh(new THREE.PlaneGeometry(width, height, useGrid ? width : 1, useGrid ? height : 1), this.bufferMaterial));
	}

	render(renderer, camera, tIn, tOut, texUniformName) {
		this.updateUniform(texUniformName, tIn.texture);
		renderer.render(this.bufferScene, camera, tOut, true);
	}

	regularRender(renderer, camera, tOut) {
		renderer.render(this.bufferScene, camera, tOut, true);
	}

	updateUniform(name, value) {
		this.bufferMaterial.uniforms[name].value = value;
	}
}