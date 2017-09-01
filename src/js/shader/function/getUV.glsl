vec2 getTextureUv(vec2 pos, float maxWidth, float maxHeight){
    float step = 1.0 / min(maxWidth, maxHeight);
    float u = pos.x * step + 0.5;
    float v = pos.y * step + 0.5;
	return vec2(fract(u), fract(v));
}

vec2 getUv(vec2 pos, float maxWidth, float maxHeight){
    vec2 newPos;
    newPos.x = (pos.x + maxWidth / 2.0) / maxWidth;
    newPos.y = (pos.y + maxHeight / 2.0) / maxHeight;
    return newPos;
}