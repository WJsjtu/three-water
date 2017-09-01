uniform sampler2D u_Texture;
uniform vec2 u_Delta;
varying vec2 v_Uv;
void main() {
	vec4 info = texture2D(u_Texture, v_Uv);
	vec2 dx = vec2(u_Delta.x, 0.0);
	vec2 dy = vec2(0.0, u_Delta.y);
	float average = (texture2D(u_Texture, v_Uv - dx).r + texture2D(u_Texture, v_Uv - dy).r + texture2D(u_Texture, v_Uv + dx).r + texture2D(u_Texture, v_Uv + dy).r) * 0.25;
	info.g += (average - info.r) * 2.0;
	info.g *= 0.995;
	info.r += info.g;
	gl_FragColor = info;
}