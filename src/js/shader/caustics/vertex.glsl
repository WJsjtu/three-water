uniform vec3 u_LightDir;
uniform sampler2D u_WaterInfoTexture;
uniform float u_WaterWidth;
uniform float u_WaterHeight;
uniform float u_PoolHeight;

varying vec3 v_OldPos;
varying vec3 v_NewPos;

vec3 getHitPosition(vec3 origin, vec3 ray) {
    vec2 t = intersectCube(origin, ray, vec3(-u_WaterWidth / 2.0, -u_PoolHeight, -u_WaterHeight / 2.0), vec3(u_WaterWidth / 2.0, 0.0, u_WaterHeight / 2.0));
	return origin + ray * t.y;
}

vec3 project(vec3 pos, vec3 light) {
	vec2 delta = (-u_PoolHeight - pos.y) / light.y * light.xz;
	pos.xz += delta;
	pos.y = 0.0;
	return pos;
}

void main() {
	vec4 info = texture2D(u_WaterInfoTexture, uv);
	vec3 waveNormal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);

	vec3 refractLight0 = refract(u_LightDir, vec3(0.0, 1.0, 0.0), IOR_AIR / IOR_WATER);
	vec3 refractLight1 = refract(u_LightDir, waveNormal, IOR_AIR / IOR_WATER);

    // world coord
	vec3 worldPos = vec3(position.x, 0.0, position.y);
	vec3 hit0 = getHitPosition(worldPos, refractLight0);
	vec3 hit1 = getHitPosition(worldPos + vec3(0.0, info.r, 0.0), refractLight1);

	// project to xz plane
	v_OldPos = project(hit0, refractLight0);
	v_NewPos = project(hit1, refractLight1);

	gl_Position =  projectionMatrix * modelViewMatrix * vec4((v_NewPos.xz + refractLight0.xz / refractLight0.y), 0.0, 1.0);
}