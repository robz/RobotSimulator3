var NUM_RAYS = 200, ROWS = 60, COLS = 80;
var CELL_WIDTH, CELL_HEIGHT;

var raytracer, context, canvas, obstacle_grid;

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
	
	CELL_WIDTH = canvas.width/COLS;
	CELL_HEIGHT = canvas.height/ROWS;
    
    raytracer = new Raytracer(COLS, ROWS, CELL_WIDTH, CELL_HEIGHT);
	
	obstacle_grid = new Array(ROWS);
	for (var r = 0; r < ROWS; r++) {
		obstacle_grid[r] = new Array(COLS);
		for (var c = 0; c < COLS; c++) {
			var val = (Math.random() > .9) ? 1 : 0;
			obstacle_grid[r][c] = val;
		}
	}
    
	drawStuff(create_point(canvas.width/2, canvas.height/2));
}

function mousemove(event) {
    var mouse = null;
    
    if (event.offsetX) {
        mouse = create_point(event.offsetX, event.offsetY);
    } else if (event.layerX) {
        mouse = create_point(event.layerX - canvas.offsetLeft,
                             event.layerY - canvas.offsetTop);
    } else {
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
	for (var r = 0; r < obstacle_grid.length; r++) {
		for (var c = 0; c < obstacle_grid[0].length; c++) {
			if (obstacle_grid[r][c] == 1) {
				context.fillRect(c*CELL_WIDTH, r*CELL_HEIGHT, 
					CELL_WIDTH, CELL_HEIGHT);
			}
		}
	}
	
    for (var theta = 0; theta < 360; theta+=360/NUM_RAYS) {
        raytracer.trace_grid(start, theta*Math.PI/180, obstacle_grid, 
			unset_callback, set_callback);
    }
    
	raytracer.draw(context);
}













































