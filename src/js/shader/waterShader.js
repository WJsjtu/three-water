import {shadowColor, waterColor} from './constants'

const fragmentPrefix = [
	`precision mediump float;
	const float IOR_AIR = 1.0;
	const float IOR_WATER = 1.33;
	const vec3 SHADOW_COLOR = ${shadowColor};
	const vec3 WATER_COLOR = ${waterColor};
	uniform sampler2D u_WaterInfoTexture;
	uniform sampler2D u_CausticTex;
	uniform sampler2D u_TileTexture;
	uniform samplerCube u_SkyTexture;
	uniform vec3 u_LightDir;
	uniform float u_WaterWidth;
	uniform float u_WaterHeight;
	uniform float u_PoolHeight;
	varying vec3 v_WorldPos;
	varying vec2 v_Uv;`,
	require('./function/getUV.glsl'),
	require('./function/intersectCube.glsl'),
	require('./function/getWallColorForWater.glsl')
].join('\n');


const Shader = [{
	uniforms: {
		'u_TileTexture': {type: 't', value: null},
		'u_SkyTexture': {type: 't', value: null},
		'u_WaterInfoTexture': {type: 't', value: null},
		'u_CausticTex': {type: 't', value: null},
		'u_LightDir': {type: 't', value: null},
		'u_WaterWidth': {type: 'f', value: 128.0},
		'u_WaterHeight': {type: 'f', value: 128.0},
		'u_PoolHeight': {type: 't', value: null}
	},
	vertexShader: require('./water/vertex.glsl'),
	fragmentShader: fragmentPrefix + require('./water/above.glsl')
}, {
	uniforms: {
		'u_TileTexture': {type: 't', value: null},
		'u_SkyTexture': {type: 't', value: null},
		'u_WaterInfoTexture': {type: 't', value: null},
		'u_CausticTex': {type: 't', value: null},
		'u_LightDir': {type: 't', value: null},
		'u_WaterWidth': {type: 'f', value: 128.0},
		'u_WaterHeight': {type: 'f', value: 128.0},
		'u_PoolHeight': {type: 't', value: null}
	},
	vertexShader: require('./water/vertex.glsl'),
	fragmentShader: fragmentPrefix + require('./water/under.glsl')
}];

export default Shader;