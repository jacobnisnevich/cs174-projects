var gl;

// Constants for drawArrays
var numVertices = 14;
var numOutlineVertices = 24;

// Containers for colors and vertices to be passed to shaders
var pointsArray = [];
var colorsArray = [];

// Camera set up
var aspect;
var fovy = 45.0;
var near = 10.0;
var far = 100.0;

// Rotation variables
var theta = 0.0;
var thetaLoc;
var s;

// Camera matrix set up
var modelViewMatrixLoc;
var perspectiveMatrixLoc;
var mvMatrix, pMatrix;
var modelView, projection;

// Color buffer set up
var cBuffer;
var colorindex = 0;

// Offsets for keyboard navigation
var xOffset = 0;
var yOffset = 0;
var zOffset = 0;

// Rotation for left and right arrow keys
var xRotate = 0;

// FoV changes due to keyboard hotkeys
var fovEffect = 0;

var vertices = [
	vec4(2.0, 2.0, -2.0, 1.0),
	vec4(2.0, -2.0, -2.0, 1.0),
	vec4(-2.0,  -2.0, -2.0, 1.0),
	vec4(-2.0, 2.0, -2.0, 1.0),
	vec4(2.0, 2.0, 2.0, 1.0),
	vec4(2.0,  -2.0, 2.0, 1.0),
	vec4(-2.0,  -2.0, 2.0, 1.0),
	vec4(-2.0, 2.0, 2.0, 1.0) 
];

var outlineVertices = [
	vec4(2.01, 2.01, -2.01, 1.0),
	vec4(2.01, -2.01, -2.01, 1.0),
	vec4(-2.01,  -2.01, -2.01, 1.0),
	vec4(-2.01, 2.01, -2.01, 1.0),
	vec4(2.01, 2.01, 2.01, 1.0),
	vec4(2.01,  -2.01, 2.01, 1.0),
	vec4(-2.01,  -2.01, 2.01, 1.0),
	vec4(-2.01, 2.01, 2.01, 1.0) 
];

var vertexColors = [
	vec4( 0.9, 0.0, 0.0, 1.0 ),  // red
	vec4( 0.9, 0.9, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 0.9, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
	vec4( 0.5, 0.2, 0.7, 1.0 ),  // purple
	vec4( 0.8, 0.8, 0.8, 1.0 )  // grey
];

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );

	// Set aspect ratio
	aspect = canvas.width/canvas.height;
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	//
	//  Configure WebGL
	//

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	gl.lineWidth(5.0);
	gl.enable(gl.DEPTH_TEST);
	
	//  Load shaders and initialize attribute buffers
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	createPointsArray();
	createOutlineArray();
	
	// Load the data into the GPU

	cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
	
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor);

	// Initial vertices and pass to buffer

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
	
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
 
	// Set up projection and model view matrices

	modelView = gl.getUniformLocation( program, "modelView" );
	projection = gl.getUniformLocation( program, "projection" );
	thetaLoc = gl.getUniformLocation( program, "theta" );

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	render();
};

// Function to create array of cube vertices

function createPointsArray() {
	pointsArray.push(vertices[4]); 
	pointsArray.push(vertices[0]); 
	pointsArray.push(vertices[7]); 
	pointsArray.push(vertices[3]); 
	pointsArray.push(vertices[2]); 
	pointsArray.push(vertices[0]);
	pointsArray.push(vertices[1]); 
	pointsArray.push(vertices[5]); 
	pointsArray.push(vertices[2]); 
	pointsArray.push(vertices[6]); 
	pointsArray.push(vertices[7]); 
	pointsArray.push(vertices[5]);
	pointsArray.push(vertices[4]); 
	pointsArray.push(vertices[0]);
}

// Function to pass array of outline vertices

function createOutlineArray() {
	pointsArray.push(outlineVertices[3]);
	pointsArray.push(outlineVertices[0]);
	pointsArray.push(outlineVertices[3]);
	pointsArray.push(outlineVertices[2]);
	pointsArray.push(outlineVertices[3]);
	pointsArray.push(outlineVertices[7]);
	pointsArray.push(outlineVertices[7]);
	pointsArray.push(outlineVertices[4]);
	pointsArray.push(outlineVertices[7]);
	pointsArray.push(outlineVertices[6]);
	pointsArray.push(outlineVertices[6]);
	pointsArray.push(outlineVertices[2]);
	pointsArray.push(outlineVertices[6]);
	pointsArray.push(outlineVertices[5]);
	pointsArray.push(outlineVertices[5]);
	pointsArray.push(outlineVertices[4]);
	pointsArray.push(outlineVertices[5]);
	pointsArray.push(outlineVertices[1]);
	pointsArray.push(outlineVertices[1]);
	pointsArray.push(outlineVertices[0]);
	pointsArray.push(outlineVertices[1]);
	pointsArray.push(outlineVertices[2]);
	pointsArray.push(outlineVertices[0]);
	pointsArray.push(outlineVertices[4]);
}

// Function to create array of colors

function createColorsArray(index, white) {
	colorsArray = [];
	for (var i = 0; i < 42; i++) {
		if (white) {
			colorsArray.push(vec4( 1.0, 1.0, 1.0, 1.0 ));
		} else {
			colorsArray.push(vertexColors[index]);
		}
	}
}

// Keyboard hotkey handling

document.onkeydown = function(event) {
	var radian = radians(xRotate);
	if (event.keyCode == 67) {
		// 67 = 'c'
		// c - cycle cube face colors
		colorindex++;
	} else if (event.keyCode == 38) {
		// 38 = 'up'
		// up - y position up
		yOffset--;
	} else if (event.keyCode == 40) {
		// 40 = 'down'
		// down - y position down
		yOffset++;
	} else if (event.keyCode == 37) {
		// 37 = 'left'
		// left - x position left
		xRotate--;
	} else if (event.keyCode == 39) {
		// 39 = 'right'
		// right - x position right
		xRotate++;
	} else if (event.keyCode == 73) {
		// 73 = 'i'
		// i - forward
		xOffset -= (0.25 * Math.sin(radian));
		zOffset += (0.25 * Math.cos(radian));
	} else if (event.keyCode == 74) {
		// 74 = 'j'
		// j - left
		xOffset += (0.25 * Math.sin(radian));
		zOffset += (0.25 * Math.cos(radian));
	} else if (event.keyCode == 75) {
		// 75 = 'k'
		// k - right
		xOffset -= (0.25 * Math.sin(radian));
		zOffset -= (0.25 * Math.cos(radian));
	} else if (event.keyCode == 77) {
		// 77 = 'm'
		// m - backward
		xOffset += (0.25 * Math.sin(radian));
		zOffset -= (0.25 * Math.cos(radian));
	} else if (event.keyCode == 82) {
		// 82 = 'r'
		// r - reset position
		xOffset = 0;
		zOffset = 0;
		xRotate = 0;
		yRotate = 0;
		fovEffect = 0;
	} else if (event.keyCode == 78) {
		// 78 = 'n'
		// n - narrower horizontal fov
		fovEffect--;
	} else if (event.keyCode == 87) {
		// 87 = 'w'
		// w - wider horizontal fov
		fovEffect++;
	} else if (event.keyCode === 187 && event.shiftKey) {
		// 187 = '=' and check if shift pressed
		// + - show crosshair
		if (document.getElementById( "crosshair" ).style.display == 'none') {
			document.getElementById( "crosshair" ).style.display = 'block';
		} else {
			document.getElementById( "crosshair" ).style.display = 'none';
		}
	} 

}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	// Model-view matrix and Perspective Matrix
	pMatrix = perspective(fovy + fovEffect, aspect, near, far);
	pMatrix = mult(pMatrix, rotate(xRotate, vec3(0, 1, 0)));
	pMatrix = mult(pMatrix, translate(xOffset, yOffset, zOffset));
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	// Rotation
	theta += 0.1;
	gl.uniform1f(thetaLoc, theta);
	s = Math.sin(theta);

	for (var ztranslate = -40; ztranslate > -61; ztranslate -= 20) {
		for (var ytranslate = -10; ytranslate < 11; ytranslate += 20) {
			for (var xtranslate = -10; xtranslate < 11; xtranslate += 20) {

				// Position each cube
				mvMatrix = mat4();
				mvMatrix = mult(mvMatrix, translate(xtranslate, ytranslate, ztranslate));
				mvMatrix[0][0] *= 1 + ( .1 * s );
				mvMatrix[1][1] *= 1 + ( .1 * s );
				mvMatrix[2][2] *= 1 + ( .1 * s );

				gl.uniform1f(thetaLoc, theta);
				gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

				// Draw Cubes
				createColorsArray((colorindex % 8), false);		
				gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);

				// Draw Outlines
				createColorsArray(colorindex, true);
				gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
				gl.drawArrays(gl.LINES, 14, numOutlineVertices);

				colorindex++;
			}
		}
	}

	requestAnimFrame( render );
}
