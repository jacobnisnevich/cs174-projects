# Assignment 2: Solar System

## Introduction

The second project of the quarter was to design a solar system consisting of:

1. A sun around which the planets orbit
2. An icy planet
3. A swampy planet
4. A watery planet
5. A muddy planet
6. (Extra Credit) A moon that orbits around the muddy planet

The primary challenges for me were setting up the shaders to work properly with different types of shading, making sure the normals were generated properly, organizing the planets into a consistent object structure, and implementing the drawing of each planet with a single buffer and changing indices.

## Controls

Key       | Function
--------- | ---------------------
A         | Attach to planet 
Key Up    | Move y position up
Key Down  | Move y position down
Key Left  | Move x angle left
Key Right | Move x angle right
I         | Move forward
J         | Move left
K         | Move right
M         | Move backward
N         | Narrow FOV
W         | Widen FOV
R         | Reset positions

## Implementation

A few of the more challenging implementations are listed below. All the extra credit assignments were coompleted, including locking to a planet, and the moon oribiting a planet.

### Flat, Gouraud, and Phong Shading

The assignment required us to have the various planets have different complexities and shading types. As such, the shaders we created had to be modular and adaptable. In order to achieve this, I passed a `uniform int` with values of 0, 1, or 2 to represent Glat, Gouraud, and Phong shading, respectively.

This was done in my render loop for each sphere as follows:

```javascript
if (planets[position].shading == 'flat')
	gl.uniform1i( shadingLoc, 0 );
else if (planets[position].shading == 'gouraud')
	gl.uniform1i( shadingLoc, 1 );
else if (planets[position].shading == 'phong')
	gl.uniform1i( shadingLoc, 2 );
```

The variable was then recieved in the vertex and fragment shaders as `uniform int shading` and shading was then done conditionally with an if statement to check which type of shading is specified.

### Planet Objects

In order to organize the planets with their various speeds, sizes, colors, materials, and shading types, I used an array of javascript objects as follows:

```javascript
var planets = [ {
	name: 'sun',
	color: [0.8, 0.3, 0.0, 1.0],
	diffuse: [0.8, 0.3, 0.0, 1.0],
	specular: [1.0, 1.0, 1.0, 1.0],
	shininess: 0.0,
	size: 35,
	x: 0, 
	y: 0, 
	z: 0,
	shading: 'gouraud',
	complexity: 3,
	currentAngle: 0,
	rotationSpeed: 0,
	startIndex: 0,
	numPoints: 0
}, ... ];
```

Then in my render loop I simply looped through each planet and scaled according to the size, rotated according to speed and angle, and translated according to position. The shading was passed to the shader in the form of an int and the color, diffuse, and specular of the material were multiplied by the light and passed on to the shader. The complexity, startIndex, and numPoints are used to generate the spheres and draw them with drawArrays with:

```javascript
gl.drawArrays( gl.TRIANGLES, planets[position].startIndex, planets[position].numPoints );
```

### Buffers

In my implementation of the assignment, I used two buffers for all the normals and points for all of the spheres, and simply had dynamic start indices and end indices for draw arrays. This could potentially save memory but also makes the code substantially more simple. 

This implementation is done as follows, with a for loop creating the geometries and writing to pointsArray and normalsArray, while changing the indices for each sphere by storing them in the array of javascript objects. This is shown below:

```javascript
for (var planetNum = 0; planetNum < planets.length - 1; planetNum++) {
	planets[planetNum].startIndex = index;
	createSphere(va, vb, vc, vd, planets[planetNum].complexity, planets[planetNum].shading);
	planets[planetNum].numPoints = index - planets[planetNum].startIndex;
}
```

## Conclusions

Overall, the project took far longer than expected, but not due to the challenging nature of the topics or the code, but simply due to bugs that took far too long to find. For instance, roughly five to six hours were spent trying to find out why the normals were displaying very strangely only to discover that the root of the cause was this block of code:

```javascript
normalsArray.push(a[0],a[1], a[2], 0.0);
normalsArray.push(b[0],b[1], b[2], 0.0);
normalsArray.push(c[0],c[1], c[2], 0.0);
```

Which should have been done with vectors or simply javascript arrays as follows

```javascript
normalsArray.push([a[0],a[1], a[2], 0.0]);
normalsArray.push([b[0],b[1], b[2], 0.0]);
normalsArray.push([c[0],c[1], c[2], 0.0]);
```

The concepts of the project, which are the purpose of the assignment, were not too difficult to implement.
