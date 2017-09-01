uniform sampler2D u_Texture;
uniform vec2 u_Delta;
varying vec2 v_Uv;
void main() {
	vec4 info = texture2D(u_Texture, v_Uv);
	vec3 dx = vec3(u_Delta.x, texture2D(u_Texture, vec2(v_Uv.x + u_Delta.x, v_Uv.y)).r - info.r, 0.0);
	vec3 dy = vec3(0.0, texture2D(u_Texture, vec2(v_Uv.x, v_Uv.y + u_Delta.y)).r - info.r, u_Delta.y);
	info.ba = normalize(cross(dy, dx)).xz;
	gl_FragColor = info;
}