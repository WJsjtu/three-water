import * as THREE from 'three';

const vertexShader = require('./vertexInfo/vertexShader.glsl');

const Shader = {
	dropShader: {
		uniforms: {
			'u_Texture': {type: 't', value: null},
			'u_Center': {type: 'v2', value: new THREE.Vector2(0, 0)},
			'u_Radius': {type: 'f', value: 0.0},
			'u_Strength': {type: 'f', value: 0.0}
		},
		vertexShader,
		fragmentShader: require('./vertexInfo/dropShader.glsl')
	},
	stepShader: {
		uniforms: {
			'u_Texture': {type: 't', value: null},
			'u_Delta': {type: 'v2', value: new THREE.Vector2(0, 0)}
		},
		vertexShader,
		fragmentShader: require('./vertexInfo/stepShader.glsl')
	},
	normalShader: {
		uniforms: {
			'u_Texture': {type: 't', value: null},
			'u_Delta': {type: 'v2', value: new THREE.Vector2(0, 0)}
		},
		vertexShader,
		fragmentShader: require('./vertexInfo/normalShader.glsl')
	}
};

export default Shader;