/**
* Slab method similar method can be found in http://www.cs.utah.edu/~awilliam/box/box.pdf
*/
/**
* 这个算法基于这样一个事实，这个证明有难度，但是和容易想象和理解。
* 我们假设一个cube的6个面都有无限延伸，那么如果一条射线和cube（事实上图几何体都是）有交点，那么焦点数一定为1或者2个。
* 我们把一个交点的情况看成是2个交点重合的情况方便讨论。
* 对于cube有这样的特性，第一个交点产生之前，射线一定会线穿过2个延伸面，也就是说第一个交点在相交的第3个延伸面上。
* 第二个交点一定是在相交的第4个延伸面上。
* 对于不相交的情况可以假设相交后判断交点位置是否位于6个面的有效区域内即可。
* 所以如果只是校测是否hit到的话，可以做更加细致的优化。
*
* 注意：显然对于origin在cube内部的情况这个函数并不适用，所水下效果要另外构造光线追踪函数。
*/
vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
    /* 把光线按速度分量划分用以计算到达各个延伸面的时间权重 */
	vec3 t1 = (cubeMin - origin) / ray;
	vec3 t2 = (cubeMax - origin) / ray;
	/* 每个分量的最小值 */
	vec3 ta = min(t1, t2);
	/* 每个分量的最大值 */
	vec3 tb = max(t1, t2);
	/* 在最小分量中选取最大值，这个最大值刚好是相交的第3个延伸面*/
	float tMin = max(max(ta.x, ta.y), ta.z);
	/* 在最大分量中选取最小值，这个最大值刚好是相交的第4个延伸面*/
	float tMax = min(min(tb.x, tb.y), tb.z);
	/* 返回第一个交点（近点）和第二个交点（远点） */
	return vec2(tMin, tMax);
}