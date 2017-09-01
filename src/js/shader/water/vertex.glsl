uniform sampler2D u_WaterInfoTexture;
varying vec3 v_WorldPos;
varying vec2 v_Uv;
void main() {
    vec4 info = texture2D(u_WaterInfoTexture, uv);
    /* switch to xz plane */
	vec4 worldPos = modelMatrix * vec4(position + vec3(0.0, 0.0, info.r), 1.0);
	gl_Position = projectionMatrix * viewMatrix * worldPos;
	v_WorldPos = worldPos.xyz;
	v_Uv = uv;
}