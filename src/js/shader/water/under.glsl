void main() {

	vec4 info = texture2D(u_WaterInfoTexture, v_Uv);
	vec2 myUv = v_Uv;

	/* make water look more "peaked" */
	for (int i = 0; i < 10; i++) {
		myUv += info.ba * 0.005;
		info = texture2D(u_WaterInfoTexture, myUv);
	}

	vec3 eyeRay = normalize(v_WorldPos - cameraPosition);
	vec3 worldNormal = - vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);


	float fresnel = mix(0.5, 1.0, pow(1.0 + dot(worldNormal, eyeRay), 3.0));

	vec3 reflectRay = reflect(eyeRay, worldNormal);
	/* refract 函数自动处理了全反射的情况,  全反射length(refractRay) == 0.0*/
	vec3 refractRay = refract(eyeRay, worldNormal, IOR_WATER / IOR_AIR);

	vec3 refractLight = refract(u_LightDir, worldNormal, IOR_AIR / IOR_WATER);

	// reflect causticTex + tileTexture
	vec3 reflectColor = reflectRay.y <= 0.0 ?
	    getWallColorForWater(v_WorldPos, reflectRay, refractLight, u_WaterWidth, u_WaterHeight) :
	    textureCube(u_SkyTexture, vec3(-reflectRay.x, reflectRay.yz)).rgb;

	// refract textureCube
	vec3 refractColor = length(refractRay) == 0.0 ? vec3(0.0, 0.0, 0.0) : textureCube(u_SkyTexture, vec3(-refractRay.x, refractRay.yz)).rgb;

	gl_FragColor = vec4(mix(reflectColor, refractColor, (1.0 - fresnel) * length(refractRay)), 1.0);
}