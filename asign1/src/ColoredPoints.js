// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  } `

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Globals
let canvas
let gl
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals for UI
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segments = 10;
let g_randomDrawMode = false;

function addActionsForHTMLUI() {
  // Button Events
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

  document.getElementById('clear').onclick = function() { g_shapeList = []; renderAllShapes(); };

  document.getElementById('point').onclick = function() { g_selectedType = POINT; };
  document.getElementById('triangle').onclick = function() { g_selectedType = TRIANGLE; };
  document.getElementById('circle').onclick = function() { g_selectedType = CIRCLE; };

  document.getElementById('goku').onclick = drawGoku;

  // Slider Elements
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('segmentsSlide').addEventListener('mouseup', function() { g_segments = this.value });

  document.getElementById('transSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100.0 });

  // Checkbox Elements
  document.getElementById('randomColorMode').addEventListener('change', function() { g_randomDrawMode = this.checked; });
}

function main() {

  setupWebGL();
  
  // Extract event click and return it in WebGL coords
  connectVariablesToGLSL();

  // Set up action for HTML UI elements
  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { 
    if(ev.buttons == 1) { 
      click(ev) 
    };
    
    if(g_randomDrawMode) {
      g_selectedColor = [Math.random(), Math.random(), Math.random(), 1.0]
    };
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.5, 0.5, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes =  [];  // The array to store the size of a point 
function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  switch(g_selectedType) {
    case POINT:
      point = new Point();
      break;
    case TRIANGLE:
      point = new Triangle();
      break;
    case CIRCLE:
      point = new Circle();
      point.segments = g_segments;
      break;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapeList.push(point);

  // // Store the coordinates to g_points array
  // g_points.push([x, y]);
  // // Store the color to g_points array
  // g_colors.push(g_selectedColor.slice());

  // g_sizes.push(g_selectedSize);

  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  // Draw Every Shape
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  console.log(x + ", " + y);
  return([x, y]);
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapeList.length;
  for(var i = 0; i < len; i++) {
    g_shapeList[i].render();
  }
}

function drawGoku() {
  // Clear any existing shapes from the interactive list
  g_shapeList = [];

  // Helper to set color and draw a triangle
  function d(col, verts) {
    gl.uniform4f(u_FragColor, col[0], col[1], col[2], col[3]);
    drawTriangle(verts);
  }

  // Colors
  const SKIN = [1.0, 0.8, 0.6, 1.0];
  const SHADOWED_SKIN = [1.0, 0.7, 0.5, 1.0];
  const HAIR = [0.0, 0.0, 0.0, 1.0];
  const WHITE = [1.0, 1.0, 1.0, 1.0];
  const RED = [1.0, 0.0, 0.0, 1.0];
  const BLUE = [0.0, 0.0, 1.0, 1.0];

  // Clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  // // Hair Spikes
  d(HAIR, [-0.27, -0.4, -0.5, -0.3, -0.3, -0.2]);
  d(HAIR, [0.27, -0.4, 0.5, -0.3, 0.3, -0.2]);
  d(HAIR, [-0.3, -0.25, -0.8, 0.0, -0.34, 0.2]);
  d(HAIR, [-0.35, 0.15, -0.9, 0.5, -0.2, 0.4]);
  d(HAIR, [-0.25, 0.35, -0.3, 0.8, 0.1, 0.35]);
  d(HAIR, [0.08, 0.36, 0.02, 0.75, 0.3, 0.3]);
  d(HAIR, [0.35, -0.25, 0.7, -0.075, 0.55, 0.0]);
  d(HAIR, [0.55, 0.0, 0.95, 0.2, 0.3, 0.3]);

  // Hair Background Fill
  d(HAIR, [0.27, -0.4, 0.3, 0.3, 0.55, 0.0]);
  d(HAIR, [0.3, 0.3, -0.3, -0.25, -0.2, 0.4]);
  d(HAIR, [0.3, 0.3, -0.3, -0.25, 0.27, -0.4]);
  d(HAIR, [-0.3, -0.25, -0.2, 0.4, -0.35, 0.15]);
  d(HAIR, [-0.2, 0.4, 0.3, 0.3, 0.08, 0.36]);

  // Ears
  d(SHADOWED_SKIN, [-0.27, -0.35, -0.4, -0.2, -0.3, -0.05]);
  d(SHADOWED_SKIN, [0.27, -0.35, 0.4, -0.2, 0.3, -0.05]);

  // Head
  d(SKIN, [-0.27, -0.5, 0.27, -0.5, -0.33, 0.04]);
  d(SKIN, [0.27, -0.5, 0.33, 0.04, -0.33, 0.04]);

  // Chin
  d(SKIN, [-0.27, -0.5, 0.0, -0.65, 0.27, -0.5]);

  // Nose
  d(SHADOWED_SKIN, [0.0, -0.4, 0.0, -0.3, -0.05, -0.4]);
  d(SHADOWED_SKIN, [-0.05, -0.4, 0.0, -0.425, 0.05, -0.4]);

  // Eyebrows
  d(HAIR, [-0.07, -0.25, -0.25, -0.18, -0.2, -0.12]);
  d(HAIR, [0.07, -0.25, 0.25, -0.18, 0.2, -0.12]);

  // Eye Back
  d(WHITE, [-0.07, -0.25, -0.23, -0.25, -0.25, -0.18]);
  d(WHITE, [0.07, -0.25, 0.23, -0.25, 0.25, -0.18]);

  // Pupils
  d(HAIR, [-0.2, -0.19, -0.18, -0.23, -0.13, -0.228]);
  d(HAIR, [0.2, -0.19, 0.18, -0.23, 0.13, -0.228]);
}