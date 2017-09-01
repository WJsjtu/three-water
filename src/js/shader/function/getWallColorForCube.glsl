vec4 getWallColorForCube(vec3 worldPos, vec3 ray, vec3 lightDir, float width, float height){
	vec3 color;
	vec3 faceNormal;

	vec2 t = intersectCube(worldPos, ray, vec3(-width / 2.0, -u_PoolHeight, -height / 2.0), vec3(width / 2.0, 0.0, height / 2.0));
	vec3 hit = worldPos + t.y * ray;

	const float DELTA = 0.001;

	if (width / 2.0 - abs(hit.x) <= DELTA){
        color = (texture2D(u_TileTexture, getTextureUv(hit.yz, width, height))).xyz;
        faceNormal = vec3(1.0, 0.0, 0.0);
	} else if(height / 2.0 - abs(hit.z) <= DELTA){
        color = (texture2D(u_TileTexture, getTextureUv(hit.xy, width, height))).xyz;
        faceNormal = vec3(0.0, 0.0, 1.0);
	} else if(hit.y <= -u_PoolHeight + DELTA){
        color = (texture2D(u_TileTexture, getTextureUv(hit.xz, width, height))).xyz;
        faceNormal = vec3(0.0, 1.0, 0.0);
	} else{
	    return vec4(0.0); // transparent
	}

    float diffuse = dot(faceNormal, u_LightDir);
	diffuse = 0.3 * ((diffuse >= 0.0)? 1.0 : 0.0) * diffuse + 0.7;

	// shadow
	vec2 t2 = intersectCube(hit, -u_LightDir, vec3(-width / 2.0, -u_PoolHeight, -height / 2.0), vec3(width / 2.0, 0.0, height / 2.0));
    vec3 inverseHit = hit - t2.y * u_LightDir;
	vec3 lit = (inverseHit.y < -DELTA) ? SHADOW_COLOR : vec3(1.0, 1.0, 1.0);

	// caustics
	vec2 causticsUv = getUv((hit.xz - hit.y * lightDir.xz / lightDir.y), width, height);
	causticsUv.y = 1.0 - causticsUv.y;
	float caustics = texture2D(u_CausticTex, causticsUv).r;
	float litCaustics = pow(lit.x, 2.0);

	color *= diffuse * UNDERWATER_DIM * WATER_COLOR * (lit * 0.8 + litCaustics * caustics * 0.8);


	return vec4(color, 1.0);
}