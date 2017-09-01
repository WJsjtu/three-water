/* 从上往下看 */
void main() {
	vec4 info = texture2D(u_WaterInfoTexture, v_Uv);
	vec2 myUv = v_Uv;

	float ETA = IOR_AIR / IOR_WATER;

	/* make water look more "peaked" */
	for (int i = 0; i < 10; i++) {
		myUv += info.ba * 0.005;
		info = texture2D(u_WaterInfoTexture, myUv);
	}

	vec3 eyeRay = normalize(v_WorldPos - cameraPosition);
	vec3 worldNormal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);

    /* 菲涅尔效应 */
	float fresnel = mix(0.25, 1.0, pow(1.0 + dot(worldNormal, eyeRay), 3.0));

	vec3 reflectRay = reflect(eyeRay, worldNormal);
	vec3 refractRay = refract(eyeRay, worldNormal, ETA);


    /* 折射角度计算 */
    vec3 refractLight = refract(u_LightDir, worldNormal, ETA);
    /* 折射光 */
    vec3 refractColor = getWallColorForWater(v_WorldPos, refractRay, refractLight, u_WaterWidth, u_WaterHeight);


    vec3 reflectColor = reflectRay.y >= 0.0 ?
        /* 普通情况 */
        textureCube(u_SkyTexture, vec3(-reflectRay.x, reflectRay.yz)).rgb :
        /* 出现在波纹侧面的情况 */
        getWallColorForWater(v_WorldPos, reflectRay, refractLight, u_WaterWidth, u_WaterHeight);

    gl_FragColor = vec4(mix(refractColor, reflectColor, fresnel), 1.0);
}