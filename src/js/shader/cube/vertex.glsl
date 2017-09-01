precision mediump float;
varying vec3 v_WorldPos;
uniform float u_PoolHeight;

void main(){
	vec4 worldPos = modelMatrix * vec4(position, 1.0);
	worldPos.y *= u_PoolHeight;
	gl_Position = projectionMatrix * viewMatrix * worldPos;
	v_WorldPos = worldPos.xyz;
}