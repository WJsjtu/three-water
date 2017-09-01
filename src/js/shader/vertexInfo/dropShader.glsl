const float PI = 3.141592653589793;
uniform sampler2D u_Texture;
uniform vec2 u_Center;
uniform float u_Radius;
uniform float u_Strength;
varying vec2 v_Uv;
void main() {
    vec4 info = texture2D(u_Texture, v_Uv);
    float drop = max(0.0, 1.0 - length(u_Center - v_Uv) / u_Radius);
    drop = 0.5 - cos(drop * PI) * 0.5;
    info.r += drop * u_Strength;
    gl_FragColor = info;
}