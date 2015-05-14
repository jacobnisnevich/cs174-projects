var gl;

var program;

// Constants for drawArrays
var numVertices = 36;

// Containers for colors and vertices to be passed to shaders
var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

// Texture variables
var texture;
var texSize = 64;
var texCoord = [
	vec2(0, 0),
	vec2(0, 1),
	vec2(1, 1),
	vec2(1, 0)
];

// Camera set up
var aspect;
var fovy = 45.0;
var near = 0.1;
var far = 200.0;

// Rotation and scrolling variables
var geometryTheta = 0;
var geometryRotation = false;
var textureTheta = 0;
var textureRotation = false;
var textureScroll = 0;
var textureScrolling = false;

// Camera matrix set up
var modelViewMatrixLoc;
var perspectiveMatrixLoc;
var mvMatrix, pMatrix;
var modelView, projection;

// Offsets for keyboard navigation
var xOffset = 0;
var yOffset = 0;
var zOffset = -3;

// Rotation for left and right arrow keys
var xRotate = 0;

// FoV changes due to keyboard hotkeys
var fovEffect = 0;

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5, -0.5, -0.5, 1.0 ),
	vec4( -0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
	vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
	vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
	vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
	vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];   

function configureTexture(i) {
	var image;
	if (i == 0) {
		image = document.getElementById("texCompanionCube");
	} else {
		image = document.getElementById("texNormalCube");
	}

	texture = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image );
	if (i == 0) {
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	} else {
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	}
	
	gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

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
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	colorCube();

	// Initialize vertices and pass to buffer

	// Colors

	var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	// Vertices

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
	
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
 
	// Textures

	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

	var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vTexCoord );

	// Set up projection and model view matrices

	modelView = gl.getUniformLocation( program, "modelView" );
	projection = gl.getUniformLocation( program, "projection" );

	render();
};

// Function to create array of cube vertices

function quad(a, b, c, d) {
	 pointsArray.push(vertices[a]); 
	 colorsArray.push(vertexColors[a]); 
	 texCoordsArray.push(texCoord[0]);

	 pointsArray.push(vertices[b]); 
	 colorsArray.push(vertexColors[a]);
	 texCoordsArray.push(texCoord[1]); 

	 pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[a]);
	 texCoordsArray.push(texCoord[2]); 
   
	 pointsArray.push(vertices[a]); 
	 colorsArray.push(vertexColors[a]);
	 texCoordsArray.push(texCoord[0]); 

	 pointsArray.push(vertices[c]); 
	 colorsArray.push(vertexColors[a]);
	 texCoordsArray.push(texCoord[2]); 

	 pointsArray.push(vertices[d]); 
	 colorsArray.push(vertexColors[a]);
	 texCoordsArray.push(texCoord[3]);   
}

function colorCube() {
	quad( 1, 0, 3, 2 );
	quad( 2, 3, 7, 6 );
	quad( 3, 0, 4, 7 );
	quad( 6, 5, 1, 2 );
	quad( 4, 5, 6, 7 );
	quad( 5, 4, 0, 1 );
}

// Keyboard hotkey handling

document.onkeydown = function(event) {
	var radian = radians(xRotate);
	if (event.keyCode == 73) {
		// 73 = 'i'
		// i - forward
		xOffset -= (0.25 * Math.sin(radian));
		zOffset += (0.25 * Math.cos(radian));
	} else if (event.keyCode == 79) {
		// 79 = 'o'
		// o - backward
		xOffset += (0.25 * Math.sin(radian));
		zOffset -= (0.25 * Math.cos(radian));
	} else if (event.keyCode == 82) {
		// 82 = 'r'
		// r - begin rotation of cube geometry
		geometryRotation = !geometryRotation;
	} else if (event.keyCode == 83) {
		// 83 = 's'
		// s - begin texture scrolling
		textureScrolling = !textureScrolling; 
	} else if (event.keyCode == 84) {
		// 84 = 't'
		// t - begin rotation of cube textures
		textureRotation = !textureRotation;
	}
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	// If texture scrolling is activated, increment texture offset slightly
	if (textureScrolling && textureScroll != 1) {
		textureScroll += 0.01;
	} else if (textureScrolling && textureScroll == 1) {
		textureScroll = 0.01;
	}

	// If geometry rotation is activated, increment degrees so that 10 rpm is achieved
	if (geometryRotation && geometryTheta != 360) {
		geometryTheta += 1;
	} else if (geometryRotation && geometryTheta == 360) {
		geometryTheta = 1;
	}

	// If texture rotation is activated, increment degrees so that 15 rpm is achieved
	if (textureRotation && textureTheta != 360) {
		textureTheta += 1.5;
	} else if (textureRotation && textureTheta == 360) {
		textureTheta = 1.5;
	}

	// Model-view matrix and Perspective Matrix
	pMatrix = perspective(fovy + fovEffect, aspect, near, far);
	pMatrix = mult(pMatrix, rotate(xRotate, vec3(0, 1, 0)));
	pMatrix = mult(pMatrix, translate(xOffset, yOffset, zOffset));
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	// Position the cubes
	for (var i = 0; i < 2; i++) {
		mvMatrix = mat4();
		mvMatrix = mult(mvMatrix, translate(-1 + (2 * i), 0, 0));

		// Geometry rotation
		if (i == 0) {
			mvMatrix = mult(mvMatrix, rotate(geometryTheta, [0, 1, 0]));
		} else {
			mvMatrix = mult(mvMatrix, rotate(geometryTheta / 2, [1, 0, 0]));
		}

		// Pass model-view matrix
		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

		// Set-up textures
		configureTexture(i);

		// Pass cube index
		gl.uniform1i(gl.getUniformLocation(program, "cubeNum"), i);

		// Pass texture scrolling 
		gl.uniform1f(gl.getUniformLocation(program, "textureScroll"), textureScroll);

		// Pass texture rotation
		gl.uniform1f(gl.getUniformLocation(program, "textureRotation"), textureTheta);

		// Draw cubes
		gl.drawArrays(gl.TRIANGLES, 0, numVertices);
	}

	requestAnimFrame( render );
}
