var gl;

var numVertices = 14;

var pointsArray = [];
var colorsArray = [];

var aspect;
var fovy = 45.0;
var near = 10.0;
var far = 100.0;
var rotato = 0;

var modelViewMatrixLoc;
var perspectiveMatrixLoc;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;

var mvMatrix, pMatrix;
var modelView, projection;

var cBuffer;

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

var vertexColors = [
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
    vec4( 0.5, 0.2, 0.7, 1.0 ),  // who knows what
    vec4( 1.0, 1.0, 1.0, 1.0 )  // white
];

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );

	aspect = canvas.width/canvas.height;
	
	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	//
	//  Configure WebGL
	//

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	gl.enable(gl.DEPTH_TEST);
	
	//  Load shaders and initialize attribute buffers
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	createPointsArray();
	
	// Load the data into the GPU

	cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
	
	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
	
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
 
	modelView = gl.getUniformLocation( program, "modelView" );
	projection = gl.getUniformLocation( program, "projection" );
	
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	render();
};

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

function createColorsArray(index) {
	colorsArray = [];
	for (var i = 0; i < 42; i++) {
		colorsArray.push(vertexColors[index]);
	}
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	var rotation = rotate(rotato, vec3(1, 0, 0));

	// Model-view matrix and Perspective Matrix
	pMatrix = perspective(fovy, aspect, near, far);
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );


	for (var ztranslate = -40; ztranslate > -61; ztranslate -= 20) {
		for (var ytranslate = -10; ytranslate < 11; ytranslate += 20) {
			for (var xtranslate = -10; xtranslate < 11; xtranslate += 20) {
				for (var colorindex = 0; colorindex < 8; colorindex++) {
					mvMatrix = mat4();
					// mvMatrix = mult(mvMatrix, rotation);
					mvMatrix = mult(mvMatrix, translate(xtranslate, ytranslate, ztranslate));
					gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

					createColorsArray(colorindex);
					
					gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

					gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);
				}
			}
		}
	}

	rotato += 0.5;
	requestAnimFrame( render );
}
