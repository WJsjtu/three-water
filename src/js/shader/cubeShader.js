import {shadowColor, waterColor, underWaterDim} from './constants'

const Shader = {
	uniforms: {
		'u_TileTexture': {type: 't', value: null},
		'u_WaterInfoTexture': {type: 't', value: null},
		'u_CausticTex': {type: 't', value: null},
		'u_LightDir': {type: 't', value: null},
		'u_WaterWidth': {type: 'f', value: 128.0},
		'u_WaterHeight': {type: 'f', value: 128.0},
		'u_PoolHeight': {type: 't', value: null}
	},
	vertexShader: require('./cube/vertex.glsl'),
	fragmentShader: [
		`precision mediump float;
		const float IOR_AIR = 1.0;
		const float IOR_WATER = 1.33;
		const vec3 SHADOW_COLOR = ${shadowColor};
		const vec3 WATER_COLOR = ${waterColor};
		const float UNDERWATER_DIM = ${underWaterDim};
		uniform sampler2D u_WaterInfoTexture;
		uniform sampler2D u_CausticTex;
		uniform sampler2D u_TileTexture;
		uniform vec3 u_LightDir;
		uniform float u_WaterWidth;
		uniform float u_WaterHeight;
		uniform float u_PoolHeight;
		varying vec3 v_WorldPos;`,
		require('./function/getUV.glsl'),
		require('./function/intersectCube.glsl'),
		require('./function/getWallColorForCube.glsl'),
		`void main(){
			vec4 info = texture2D(u_WaterInfoTexture, getUv(v_WorldPos.xz, u_WaterWidth, u_WaterHeight));
			vec3 worldNormal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);
			vec3 refractLight = refract(u_LightDir, worldNormal, IOR_AIR / IOR_WATER);
			vec3 eyeRay = v_WorldPos - cameraPosition;
			vec4 wallColor = getWallColorForCube(v_WorldPos, eyeRay, refractLight, u_WaterWidth, u_WaterHeight);
			gl_FragColor = wallColor;
		}`
	].join('\n')
};

export default Shader;