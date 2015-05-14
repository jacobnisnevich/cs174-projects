# Assignment 3: Textured Cubes

## Introduction

The third assignment of the quarter required us to create two cubes with various texture mapping requirements. The first cube had a simple texture mapped on each face with a rotation about the y-axis when the "r" key is pressed, a rotating texture when the "t" key is pressed, and simply nearest neighbor filtering. The second cube has a texture zoomed out by 50% on each face with rotation about the x-axis when the "r" key is pressed, a scrolling texture when the "s" key is pressed, and mipmapping with tri-linear filtering enabled.

Note that the cubes use the companion cube and normal cube textures from the Portal series.

## Controls

Key  | Function
---- | -------------------------------------
I    | Move forward
O    | Move backward
R    | Start and stop cube geometry rotation
T    | Start and stop cube texture rotation
S    | Start and stop cube texture scrolling

## Notes On Implementation

As expected, the specification for the project was extremely vague in various cases and allowed for open interpretation in the implementation of various features. Some notes on the implementations are listed here.

### Implementation of Tri-linear Filtering

The tri-linear filtering for the mipmapping on the second cube was done very simply with a single line of code:

```javascript
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
```

The last parameter, `gl.LINEAR_MIPMAP_LINEAR`, is what specifies this specific type of filtering.

### Implementation of Object Rotating

The rotation of the cube geometries is supposed to be at 10 rpm and 5 rpm respectively. This is done by simply incrementing the rotation angle `geometryTheta` by 1 degree with each tick of the render loop as long as `geometryRotation` is set to `true`. This translates to (with 60 frames per second) 60 degrees per second, meaning 10 rotations per minute. Note that the rotation angle is scaled down by 50% for the second cube to recreate the required 5 rotations per minute. The full implementation is shown below:

```javascript
if (geometryRotation && geometryTheta != 360) {
	geometryTheta += 1;
} else if (geometryRotation && geometryTheta == 360) {
	geometryTheta = 1;
}
```

The rotation matrix is multipled with the model-view matrix prior to the call to `drawArrays` as shown below:

```javascript
if (i == 0) {
	mvMatrix = mult(mvMatrix, rotate(geometryTheta, [0, 1, 0]));
} else {
	mvMatrix = mult(mvMatrix, rotate(geometryTheta / 2, [1, 0, 0]));
}
```

### Implementation of Texture Rotating

The texture rotation is done similarly to the object geometry rotation but the increment is set to 1.5 degrees per frame, which after some computations becomes 15 rotations per minute. The full implementation is copied below:

```javascript
if (textureRotation && textureTheta != 360) {
	textureTheta += 1.5;
} else if (textureRotation && textureTheta == 360) {
	textureTheta = 1.5;
}
```

The rotation is done in the shader and will be discussed further down.

### Implementation of Texture Scrolling

The scrolling for the textures was implemented by simply adding a float to texture coordinates if the textureScrolling variable was activated. The float was incremented by 0.01 at each tick of the render loop, meaning that the textured scrolled by 60% every second. This is done as follows

```javascript
if (textureScrolling && textureScroll != 1) {
	textureScroll += 0.01;
} else if (textureScrolling && textureScroll == 1) {
	textureScroll = 0.01;
}
```

Note that the looping is reset back to 0.01 when it hits a full loop in order to ensure that it does not increment infinitely.

### Shader Implementation

The texture rotation and texture scrolling, as well as the texture being scaled down by 50% is all done in the fragment shader. The important code is shown below:

```GLSL
if (cubeNum == 1) {
	gl_FragColor = texture2D( texture, (fTexCoord * 2.0) + 0.5 + textureScroll );
} else {
	vec2 rotated = vec2(cos(radians(textureRotation)) * (fTexCoord.x - mid) + sin(radians(textureRotation)) * (fTexCoord.y - mid) + mid,
					cos(radians(textureRotation)) * (fTexCoord.y - mid) - sin(radians(textureRotation)) * (fTexCoord.x - mid) + mid);
	gl_FragColor = texture2D( texture, rotated );
}
```

Note that in this implementation `cubeNum` represents the index of the cube being textured, with 0 being the first cube on the left and 1 being the second cube on the right. If the second cube is being textured, `if (cubeNum == 1)`, then first the texture is scaled down by 50% with `fTexCoord * 2.0`, then an offset of `0.5` is added to center the texture, and finally the `textureScroll` is added to allow the texture to scroll continuously when `textureScrolling` is set to true.

If the first cube is being textured, first the texture is rotated by the angle of rotation `textureRotation`. This is done by multiplying a generic rotation matrix by the `vec2 fTexCoord`. Note that the `textureRotation` variable is in degrees but the `cos` and `sin` functions in GLSL take in a variable in radians, meaning that first the angles are converted to radians using the `radians` function. The result of the multiplication is a `vec2` whcih is passed into the `texture2D` function in place of `fTexCoord` as in the other case.

## Conclusions

Overall, this project was substantially less time consuming than the previous two and also far simpler in my opinion. All points were finished within about a day of beginning the project without too much difficulty in any individual aspect.
