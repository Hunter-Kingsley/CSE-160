// DrawRectangle.js
var ctx;
function main() {
    // Retrieve <canvas> element <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    var btn = document.getElementById('drawBtn');
    if (btn) btn.addEventListener('click', handleDrawEvent);
    var opBtn = document.getElementById('drawOpBtn');
    if (opBtn) opBtn.addEventListener('click', handleDrawOperationEvent);

    // Get the rendering context for 2DCG <- (2)
    ctx = canvas.getContext('2d');
    // Draw a blue rectangle <- (3)
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    handleDrawEvent()
}

function drawVector(v, color) {
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.lineTo(ctx.canvas.width / 2 + v.elements[0] * 20, ctx.canvas.height / 2 - v.elements[1] * 20);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
}

    function angleBetween(v1, v2) {
        var d = Vector3.dot(v1, v2);
        var m1 = v1.magnitude();
        var m2 = v2.magnitude();
        if (m1 === 0 || m2 === 0) {
            return NaN;
        }
        var cosAlpha = d / (m1 * m2);
        cosAlpha = Math.max(-1, Math.min(1, cosAlpha));
        return Math.acos(cosAlpha);
    }

    function areaTriangle(v1, v2) {
        var cross = Vector3.cross(v1, v2);
        var parallelogramArea = cross.magnitude();
        return parallelogramArea / 2.0;
    }

function handleDrawEvent() {
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set a black color
    ctx.fillRect(0, 0, 400, 400); // Fill a rectangle with the color

    var x1 = document.getElementById("v1x").value;
    var y1 = document.getElementById("v1y").value;

    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, 'red')

    var x2 = document.getElementById("v2x").value;
    var y2 = document.getElementById("v2y").value;

    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, 'blue')
}

function handleDrawOperationEvent() {
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    var x1 = parseFloat(document.getElementById("v1x").value) || 0;
    var y1 = parseFloat(document.getElementById("v1y").value) || 0;
    var v1 = new Vector3([x1, y1, 0]);
    drawVector(v1, 'red');

    var x2 = parseFloat(document.getElementById("v2x").value) || 0;
    var y2 = parseFloat(document.getElementById("v2y").value) || 0;
    var v2 = new Vector3([x2, y2, 0]);
    drawVector(v2, 'blue');

    var op = document.getElementById('operation').value;

    if (op === 'add') {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
        v3.add(new Vector3([v2.elements[0], v2.elements[1], 0]));
        drawVector(v3, 'green');
    } else if (op === 'sub') {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
        v3.sub(new Vector3([v2.elements[0], v2.elements[1], 0]));
        drawVector(v3, 'green');
    } else if (op === 'mul') {
        var s = parseFloat(document.getElementById('scalar').value) || 0;
        var v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], 0]);
        v3.mul(s);
        v4.mul(s);
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    } else if (op === 'div') {
        var s = parseFloat(document.getElementById('scalar').value) || 1;
        var v3 = new Vector3([v1.elements[0], v1.elements[1], 0]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], 0]);
        if (s !== 0) {
          v3.div(s);
          v4.div(s);
          drawVector(v3, 'green');
          drawVector(v4, 'green');
        }
    } else if (op === 'mag') {
        console.log('Magnitude v1:', v1.magnitude());
        console.log('Magnitude v2:', v2.magnitude());
    } else if (op === 'angle') {
        var alpha = angleBetween(v1, v2);
        console.log('Angle:', isNaN(alpha) ? NaN : (alpha * 180 / Math.PI));
    } else if (op === 'area') {
        var area = areaTriangle(v1, v2);
        console.log('Triangle area:', area);
    } else if (op === 'nor') {
        console.log('Magnitude v1:', v1.magnitude());
        console.log('Magnitude v2:', v2.magnitude());
        var nv1 = new Vector3([v1.elements[0], v1.elements[1], 0]);
        var nv2 = new Vector3([v2.elements[0], v2.elements[1], 0]);
        nv1.normalize();
        nv2.normalize();
        drawVector(nv1, 'green');
        drawVector(nv2, 'green');
    }
}