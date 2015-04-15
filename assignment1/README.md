# Assignment 1: Floating Cubes

## Introduction

The first assignment of the class had us create an array of 8 floating cubes at the vertices of an imaginary 20x20x20 cube centered at the origin. The implementation of this involved a variety of challenges and issues, many of which were simply due to a lack of understanding of WebGL and GLSL syntax and concepts. However, over time, the assignment became easier and easier as the concepts and transformations became understandable.

## Challenges

Several of my biggest challenges are listed in this section.

### TRIANGLES to TRIANGLE_STRIP

Unfortunately the first time I had implemented my floating cubes assignment, I had done it entirely using the `TRIANGLES` OpenGL primitive, with all the points and arrays created in a specific order designed to work around this primitive. After I had discovered that extra credit could be earned by using the `TRIANGLE_STRIP` primitive, I spent about two hours working on converting the logical ordering of the vertices to work with the `TRIANGLE_STRIP` primitive.

## Notes On Implementation

As expected, the specification for the project was extremely vague in various cases and allowed for open interpretation in the implementation of various features. Some of the more unusual (in my opinion) interpretations are listed here.

### Implementation of Scaling

Many of my classmates did the scaling of the cubes in GLSL with a simple scaling matrix, while I opted to do the scaling as a matrix multiplication of the model view matrix in the javascript. Unfortunately the `mult()` function provided in MV.js struggled with the simple multiplication and I was forced to do the multiplication by hand, which luckily was fairly straightforward. This was done on lines 288 - 290 of my primary javascript file and is reprinted below:

```javascript
mvMatrix[0][0] *= 1 + ( .1 * s );
mvMatrix[1][1] *= 1 + ( .1 * s );
mvMatrix[2][2] *= 1 + ( .1 * s );
```

### Implementation of Rotation

The constant rotation of the cubes in space was done by constantly increasing an angle `theta` and passing it into the `vertex-shader`. Then, in GLSL, I computed the sine and cosine functions of the angle, created a generic rotation matrix called `rotMatrix` and multiplied it along with the model-view matrix and the projection matrix. This implementation is shown below:

```GLSL
float s = sin( theta );
float c = cos( theta );

mat4 rotMatrix = mat4 ( c,   0.0, -s,   0.0,
						0.0, 1.0,  0.0, 0.0,
						s,   0.0,  c,   0.0,
						0.0, 0.0,  0.0, 1.0 );

gl_Position = projection * modelView * rotMatrix * vPosition;
```

### Implementation of the Crosshair

Luckily, prior to working on this project I had made several HTML5/javascript-based games and know that HUD elements are best done outside of the canvas element for simplicities sake. For this reason, I implemented the crosshair as an absolutely-position image on top of the canvas element. I was able to do this very simply due to the fact that the crosshair never moves throughout the program. Unfortunately showing and hiding the crosshair was a bit of a struggle initially as I am not used to working with DOM elements in pure javascript without the help of jQuery. Furthermore, the centering of the image proved a bit troublesome at first but given that the canvas has a fixed size I was able to simply position it with absolute coordinates.

## Conclusions

Overall, the project took a substantial amount of time given how little the output seemed to be. Most of the work spent on this assignment was on figuring out syntax and behavior of various functions and objects in WebGL along with the shading language GLSL. Hopefully, further projects will not take as long to understand and prep before beginning to actually work on.