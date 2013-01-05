var NUM_RAYS = 1000, SQUARE_RATIO = .9, ROWS = 60, COLS = 80;
var CELL_WIDTH, CELL_HEIGHT;

var raytracer, context, canvas, occupancy_grid, mouse;

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
	
	CELL_WIDTH = canvas.width/COLS;
	CELL_HEIGHT = canvas.height/ROWS;
    
    raytracer = new Raytracer(COLS, ROWS, CELL_WIDTH, CELL_HEIGHT);
	mouse = create_point(null, null);
	
	occupancy_grid = new Array(ROWS);
	for (var r = 0; r < ROWS; r++) {
		occupancy_grid[r] = new Array(COLS);
		for (var c = 0; c < COLS; c++) {
			var val = (Math.random() > SQUARE_RATIO) ? 1 : 0;
			occupancy_grid[r][c] = val;
		}
	}
	
	drawStuff(create_point(canvas.width/2, canvas.height/2));
}

function mousemove(event) {
    if (event.offsetX) {
        mouse.x = event.offsetX;
		mouse.y = event.offsetY;
    } else if (event.layerX) {
        mouse.x = event.layerX - canvas.offsetLeft;
		mouse.y = event.layerY - canvas.offsetTop;
    } else {
		console.log("mouse move error!");
        return;
    }
	
	if (mouse.y < 0 || mouse.y == canvas.height || mouse.x < 0 || mouse.x == canvas.width) {
		return;
	}
    
	drawStuff(mouse);
}

function set_callback(row, col) {
	context.fillStyle = "darkGreen";
	context.fillRect(col*CELL_WIDTH, row*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
}

function unset_callback(row, col) {
	context.fillStyle = "blue";
	context.fillRect(col*CELL_WIDTH, row*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
}

function drawStuff(start) {
	context.fillStyle = "lightBlue";
    context.fillRect(0, 0, canvas.width, canvas.height);
	
    context.fillStyle = "black";
	for (var r = 0; r < occupancy_grid.length; r++) {
		for (var c = 0; c < occupancy_grid[0].length; c++) {
			if (occupancy_grid[r][c] == 1) {
				context.fillRect(c*CELL_WIDTH, r*CELL_HEIGHT, 
					CELL_WIDTH, CELL_HEIGHT);
			}
		}
	}
	
    for (var theta = 0; theta < 360; theta+=360/NUM_RAYS) {
        raytracer.trace_grid(start, theta*Math.PI/180, occupancy_grid, 
			unset_callback, set_callback);
    }
    
	raytracer.draw(context);
}