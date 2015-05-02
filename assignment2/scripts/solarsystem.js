var gl;
var program;

// Containers for colors and vertices to be passed to shaders
var pointsArray = [];
var normalsArray = [];

var index = 0;

var attached = false;

// Camera set up
var aspect;
var fovy = 45.0;
var near = 10.0;
var far = 200.0;

// Camera matrix set up
var modelViewMatrixLoc;
var perspectiveMatrixLoc;
var mvMatrix, pMatrix;
var modelView, projection;
var scaleMatrix;
var rotMatrix;
mvMatrix = mat4();

// Color buffer set up
var cBuffer;
var colorindex = 0;

// Offsets for keyboard navigation
var xOffset = 0;
var yOffset = 0;
var zOffset = -85;

// Rotation for left and right arrow keys
var xRotate = 0;

// FoV changes due to keyboard hotkeys
var fovEffect = 0;

// Lighting and shading variables
var lightPosition = vec4( 0.0, 0.0, 0.0, 1.0 );
var lightAmbient = vec4(0.7, 0.7, 0.7, 1.0);
var lightDiffuse = vec4(0.9, 0.9, 0.9, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var shadingLoc;
var sunMatrixLoc;

var ambientColor, diffuseColor, specularColor;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

// Keyboard hotkey handling
document.onkeydown = function(event) {
	var radian = radians(xRotate);
	if (event.keyCode == 65) {
		// 65 = 'a'
		// a - attach camera
		attached = !attached;
		xRotate = 0;
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
		xOffset += (0.25 * Math.cos(radian));
		zOffset += (0.25 * Math.sin(radian));
	} else if (event.keyCode == 75) {
		// 75 = 'k'
		// k - right
		xOffset -= (0.25 * Math.cos(radian));
		zOffset -= (0.25 * Math.sin(radian));
	} else if (event.keyCode == 77) {
		// 77 = 'm'
		// m - backward
		xOffset += (0.25 * Math.sin(radian));
		zOffset -= (0.25 * Math.cos(radian));
	} else if (event.keyCode == 82) {
		// 82 = 'r'
		// r - reset position
		xOffset = 0;
		yOffset = 0;
		zOffset = -85;
		xRotate = 0;
		fovEffect = 0;
		attach = false;
	} else if (event.keyCode == 78) {
		// 78 = 'n'
		// n - narrower horizontal fov
		fovEffect--;
	} else if (event.keyCode == 87) {
		// 87 = 'w'
		// w - wider horizontal fov
		fovEffect++;
	}
}

// Function to create normals

function createNormals(a, b, c, shading) {
	if (shading == 'flat') {
		var t1 = subtract(b, a);
		var t2 = subtract(c, a);
		var normal = normalize(cross(t2, t1));
		normal = vec4(normal);

		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
	} else {
		normalsArray.push(a[0],a[1], a[2], 0.0);
		normalsArray.push(b[0],b[1], b[2], 0.0);
		normalsArray.push(c[0],c[1], c[2], 0.0);
	}
}

// Function to create spheres

function createSphere(a, b, c, d, n, shading) {
	divideTriangle(a, b, c, n, shading);
	divideTriangle(d, c, b, n, shading);
	divideTriangle(a, d, b, n, shading);
	divideTriangle(a, c, d, n, shading);
}

function triangle(a, b, c, shading) {
	pointsArray.push(a);
	pointsArray.push(b);      
	pointsArray.push(c);

	if (shading == 'flat') {
		var t1 = subtract(b, a);
		var t2 = subtract(c, a);
		var normal = normalize(cross(t2, t1));
		normal = vec4(normal);

		normalsArray.push(normal);
		normalsArray.push(normal);
		normalsArray.push(normal);
	} else {
		normalsArray.push([a[0],a[1], a[2], 0.0]);
		normalsArray.push([b[0],b[1], b[2], 0.0]);
		normalsArray.push([c[0],c[1], c[2], 0.0]);
	}

	index += 3;
}

function divideTriangle(a, b, c, count, shading) {
	if ( count > 0 ) {
				
		var ab = mix( a, b, 0.5);
		var ac = mix( a, c, 0.5);
		var bc = mix( b, c, 0.5);
				
		ab = normalize(ab, true);
		ac = normalize(ac, true);
		bc = normalize(bc, true);
								
		divideTriangle( a, ab, ac, count - 1, shading );
		divideTriangle( ab, b, bc, count - 1, shading );
		divideTriangle( bc, c, ac, count - 1, shading );
		divideTriangle( ab, bc, ac, count - 1, shading );
	}
	else { 
		triangle( a, b, c, shading );
	}
}

// Function to multiply matrix and vector

function multVec(u,v) {
	var result = [];

	for (var i = 0; i < u.length; i++) {
		var sum = 0;
		for (var j = 0; j < u.length; j++) {
			sum += u[i][j] * v[j];
		}
		result.push(sum);
	}
	return result;
}

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );

	// Set aspect ratio
	aspect = canvas.width/canvas.height;
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	//  Configure WebGL

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	gl.lineWidth(5.0);
	gl.enable(gl.DEPTH_TEST);
	
	//  Load shaders and initialize attribute buffers
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	for (var planetNum = 0; planetNum < planets.length; planetNum++) {
		planets[planetNum].startIndex = index;
		createSphere(va, vb, vc, vd, planets[planetNum].complexity, planets[planetNum].shading);
		planets[planetNum].numPoints = index - planets[planetNum].startIndex;
	}

	// Buffer normals

	var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
	
	var vNormal = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vNormal);

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
	shadingLoc = gl.getUniformLocation( program, "shading");
	sunMatrixLoc = gl.getUniformLocation( program, "sunMatrix");

	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );

	render();
};


// Planet container

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
		shading: 'phong',
		complexity: 3,
		currentAngle: 0,
		rotationSpeed: 0,
		startIndex: 0,
		numPoints: 0
	}, {
		name: 'ice',
		color: [0.8, 0.8, 1.0, 1.0],
		diffuse: [0.8, 0.8, 1.0, 1.0],
		specular: [1.0, 1.0, 1.0, 1.0],
		shininess: 25.0,
		size: 7,
		x: 6, 
		y: 0, 
		z: 0,
		shading: 'flat',
		complexity: 2,
		currentAngle: 0,
		rotationSpeed: 5,
		startIndex: 0,
		numPoints: 0
	}, {
		name: 'swamp',
		color: [0.2, 1.0, 0.6, 1.0],
		diffuse: [0.2, 1.0, 0.6, 1.0],
		specular: [1.0, 1.0, 1.0, 1.0],
		shininess: 10.0,
		size: 5,
		x: 12, 
		y: 0, 
		z: 0,
		shading: 'gouraud',
		complexity: 2,
		currentAngle: 60,
		rotationSpeed: 2,
		startIndex: 0,
		numPoints: 0
	}, {
		name: 'water',
		color: [0.2, 0.5, 1.0, 1.0],
		diffuse: [0.2, 0.5, 1.0, 1.0],
		specular: [1.0, 1.0, 1.0, 1.0],
		shininess: 20.0,
		size: 13,
		x: 13, 
		y: 0, 
		z: 0,
		shading: 'phong',
		complexity: 4,
		currentAngle: 120,
		rotationSpeed: 2,
		startIndex: 0,
		numPoints: 0
	}, {
		name: 'mud',
		color: [0.5, 0.1, 0.0, 1.0],
		diffuse: [0.5, 0.1, 0.0, 1.0],
		specular: [0.5, 0.1, 0.0, 1.0],
		shininess: 30.0,
		size: 10,
		x: 25, 
		y: 0, 
		z: 0,
		shading: 'gouraud',
		complexity: 5,
		currentAngle: 0,
		rotationSpeed: 1,
		startIndex: 0,
		numPoints: 0
	}, {
		name: 'moon',
		color: [0.5, 0.5, 0.0, 1.0],
		diffuse: [0.5, 0.1, 0.0, 1.0],
		specular: [0.5, 0.1, 0.0, 1.0],
		shininess: 10.0,
		size: 0.01,
		x: 5, 
		y: 0, 
		z: 0,
		shading: 'phong',
		complexity: 2,
		currentAngle: 0,
		rotationSpeed: 3,
		startIndex: 0,
		numPoints: 0
	}
];

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	// Perspective Matrix
	if (attached) {
		var lastPlanet = planets[planets.length - 2];
		var rot = rotate(lastPlanet.currentAngle, [0, 1, 0]);
		var pos = vec4(lastPlanet.x + 15, 0, 0, 1);
		var eye = multVec(rot, pos);
		eye = [eye[0], eye[1], eye[2]];
		rot = rotate(xRotate, [0, -1, 0]);
		var at = subtract([0, 0, 0], eye);
		at[3] = 1;
		at = multVec(rot, at);
		at = at.slice(0,3);
		at = add(at, eye);
		pMatrix = lookAt(eye, at, [0, 1, 0]);
	} else {
		pMatrix = perspective(fovy + fovEffect, aspect, near, far);
		pMatrix = mult(pMatrix, rotate(xRotate, vec3(0, 1, 0)));
		pMatrix = mult(pMatrix, translate(xOffset, yOffset, zOffset));
		pMatrix = mult(pMatrix, rotate(30, vec3(1, 0, 0)));
	}
	// gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	for (var position = 0; position < planets.length; position++) {
		if (planets[position].name == 'moon') {
			// Scale the moon
			scaleMatrix = mat4();
			scaleMatrix[0][0] *= 1 + ( .1 * planets[position].size );
			scaleMatrix[1][1] *= 1 + ( .1 * planets[position].size );
			scaleMatrix[2][2] *= 1 + ( .1 * planets[position].size );

			scaleMatrix = mult(mvMatrix, scaleMatrix)

			// Rotate around mud planet
			planets[position].currentAngle += (planets[position].rotationSpeed / 2);
			rotMatrix = mult(rotate(planets[position].currentAngle, [0, 1, 0]),
				translate(planets[position].x, planets[position].y, planets[position].z));

			// Distance from mud planet
			mvMatrix = mult(scaleMatrix, rotMatrix);

		} else {
			// Scale each planet
			scaleMatrix = mat4();
			scaleMatrix[0][0] *= 1 + ( .1 * planets[position].size );
			scaleMatrix[1][1] *= 1 + ( .1 * planets[position].size );
			scaleMatrix[2][2] *= 1 + ( .1 * planets[position].size );

			mvMatrix = mult(pMatrix, scaleMatrix);

			// Rotate around sun
			planets[position].currentAngle += (planets[position].rotationSpeed / 2);
			mvMatrix = mult(mvMatrix, rotate(planets[position].currentAngle, [0, 1, 0]));

			// Position each planet
			mvMatrix = mult(mvMatrix, translate(planets[position].x, planets[position].y, planets[position].z));
		}

		ambientProduct = mult(lightAmbient, planets[position].color);
		diffuseProduct = mult(lightDiffuse, planets[position].diffuse);
		specularProduct = mult(lightSpecular, planets[position].specular);

		// Pass shading stuff to shaders
		gl.uniform4fv( gl.getUniformLocation(program, 
		   "ambientProduct"),flatten(ambientProduct) );
		gl.uniform4fv( gl.getUniformLocation(program, 
		   "diffuseProduct"),flatten(diffuseProduct) );
		gl.uniform4fv( gl.getUniformLocation(program, 
		   "specularProduct"),flatten(specularProduct) );	
		gl.uniform1f( gl.getUniformLocation(program, 
		   "shininess"), planets[position].shininess );

		// Pass to shaders
		gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );
		if (position == 0) {
			gl.uniformMatrix4fv(sunMatrixLoc, false, flatten(mvMatrix));
		}

		// Decide which type of shading
		if (planets[position].shading == 'flat')
			gl.uniform1i( shadingLoc, 0 );
		else if (planets[position].shading == 'gouraud')
			gl.uniform1i( shadingLoc, 1 );
		else if (planets[position].shading == 'phong')
			gl.uniform1i( shadingLoc, 2 );

		// Draw spheres
		gl.drawArrays( gl.TRIANGLES, planets[position].startIndex, planets[position].numPoints );
	}

	requestAnimFrame( render );
}
