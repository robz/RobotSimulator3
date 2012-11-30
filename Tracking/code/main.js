var VAR = 50, RADIUS = 10;
var CANVAS_WIDTH, CANVAS_HEIGHT, canvas, context;
var mouse, my_kalman_filter;

window.onload = function() 
{
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	CANVAS_WIDTH = canvas.width;
	CANVAS_HEIGHT = canvas.height;
	
	mouse = {x:0, y:0, found:false};
	
    // process uncertainty covariance
	Q = $M([[1e-3,0,0,0,0,0], 
            [0,1e-3,0,0,0,0], 
            [0,0,1e-4,0,0,0],
            [0,0,0,1e-3,0,0], 
            [0,0,0,0,1e-3,0], 
            [0,0,0,0,0,1e-4]]);	
            
    my_kalman_filter = new kalman_filter(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, VAR, Q);
	
	setInterval(paintCanvas, 30);
	setInterval(updateKalman, 50);
};

function mouseMoved(event) {
	mouse.found = true;

    if(event.offsetX) {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
    }
    else if(event.layerX) {
        mouse.x = event.layerX-canvas.offsetLeft;
        mouse.y = event.layerY-canvas.offsetTop;
    }
}

function paintCanvas() {
	context.fillStyle = "lightGray";
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	context.strokeStyle = "black";
	context.lineWidth = 3;
	my_kalman_filter.draw(context);
}

function updateKalman() {
	if (mouse.found) {
		var theta = Math.PI*Math.random(),
			R = gauss(0, VAR);
		my_kalman_filter.iterate(mouse.x + R*Math.cos(theta), 
                                 mouse.y + R*Math.sin(theta));
	}
}

// Box-muller transform
function gauss(mean, variance) {
	var r1 = Math.random(), r2 = Math.random();
	return mean+Math.sqrt(variance)*Math.sqrt(-2*Math.log(r1))*Math.cos(2*Math.PI*r2);
}
