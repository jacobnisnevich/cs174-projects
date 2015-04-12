var gl;

var numVertices = 36;

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

var vertices = [
	vec4(-12.0, -12.0, -8.0, 1.0),
	vec4(-12.0, -8.0, -8.0, 1.0),
	vec4(-8.0,  -8.0, -8.0, 1.0),
	vec4(-8.0, -12.0, -8.0, 1.0),
	vec4(-12.0, -12.0, -12.0, 1.0),
	vec4(-12.0,  -8.0, -12.0, 1.0),
	vec4(-8.0,  -8.0, -12.0, 1.0),
	vec4(-8.0, -12.0, -12.0, 1.0) 
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

	colorCube();
	
	// Load the data into the GPU

	var cBuffer = gl.createBuffer();
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
	
	render();
};

function colorCube() {
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}

function quad(a, b, c, d) {
	pointsArray.push(vertices[a]); 
	pointsArray.push(vertices[b]); 
	pointsArray.push(vertices[c]); 
	pointsArray.push(vertices[a]); 
	pointsArray.push(vertices[c]); 
	pointsArray.push(vertices[d]);

	createColorsArray(a);
}

function createColorsArray(index) {
	colorsArray.push(vertexColors[index]);
	colorsArray.push(vertexColors[index]);
	colorsArray.push(vertexColors[index]);
	colorsArray.push(vertexColors[index]);
	colorsArray.push(vertexColors[index]);
	colorsArray.push(vertexColors[index]);
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	var rotation = rotate(rotato, vec3(1, 0, 0));

	// Model-view matrix and Perspective Matrix

	pMatrix = perspective(fovy, aspect, near, far);
	gl.uniformMatrix4fv( projection, false, flatten(pMatrix) );

	// var cBuffer = gl.createBuffer();

	for (var ztranslate = -40; ztranslate > -61; ztranslate -= 20) {
		for (var ytranslate = 0; ytranslate < 21; ytranslate += 20) {
			for (var xtranslate = 0; xtranslate < 21; xtranslate += 20) {
				for (var colorindex = 0; colorindex < 8; colorindex++) {
					mvMatrix = mat4();
					mvMatrix = mult(mvMatrix, translate(xtranslate, ytranslate, ztranslate));
					mvMatrix = mult(mvMatrix, rotation);
					gl.uniformMatrix4fv( modelView, false, flatten(mvMatrix) );

					// createColorsArray(colorindex);
					// 
					// gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
					// gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

					gl.drawArrays(gl.TRIANGLES, 0, numVertices);
				}
			}
		}
	}

	rotato += 0.5;
	requestAnimFrame( render );
}
