const Shader = {
	uniforms: {
		'u_WaterWidth': {type: 'f', value: 128.0},
		'u_WaterHeight': {type: 'f', value: 128.0},
		'u_LightDir': {type: 'v3', value: null},
		'u_CausticTex': {type: 't', value: null},
		'u_WaterInfoTexture': {type: 't', value: null},
		'u_PoolHeight': {type: 'f', value: 0.0}
	},
	vertexShader: [
		`precision mediump float;`,
		require('./function/intersectCube.glsl'),
		`const float IOR_AIR = 1.0;`,
		`const float IOR_WATER = 1.333;`,
		require('./caustics/vertex.glsl')
	].join('\n'),
	fragmentShader: require('./caustics/fragment.glsl')
};

export default Shader;