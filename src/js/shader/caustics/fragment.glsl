precision mediump float;

uniform vec3 u_LightDir;
uniform sampler2D u_WaterInfoTexture;
uniform float u_WaterWidth;
uniform float u_WaterHeight;
uniform float u_PoolHeight;

varying vec3 v_OldPos;
varying vec3 v_NewPos;

void main() {
	float oldArea = length(dFdx(v_OldPos)) * length(dFdy(v_OldPos));
	float newArea = length(dFdx(v_NewPos)) * length(dFdy(v_NewPos));

	// make sure that only lit areas in the texture > 0.0
	float r = clamp((oldArea - newArea) / oldArea, 0.0, 1.0);
	gl_FragColor = vec4(r, 0.0, 0.0, 1.0);
}