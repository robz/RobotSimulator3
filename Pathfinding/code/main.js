var COLS, ROWS, CANVAS_WIDTH, CANVAS_HEIGHT, CELL_WIDTH, CELL_HEIGHT;
var problem;
var canvas, context;
var has_clicked = false, first_pos = null, last_pos = null;
var obstacle_grid = 
		[	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,1,1,1],
			[0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,1,0,0,1,0,1,0,1,1,1,0],
			[0,0,0,0,1,0,0,0,1,1,1,1,0,0,0,0,1,0,1,0],
			[0,0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0],
			[0,0,0,0,0,0,0,0,1,1,1,1,1,0,1,0,1,0,0,0],
			[0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1],
			[0,0,0,0,1,0,0,0,0,0,0,1,0,1,0,1,1,0,0,0],
			[0,0,0,0,1,0,1,1,1,1,1,0,0,1,0,1,0,0,1,0],
			[0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0],
			[0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,1,0,0,1,0],
			[0,0,1,1,1,1,1,0,0,1,0,1,1,1,0,1,1,0,0,0],
			[0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1],
			[1,0,0,0,1,0,1,1,0,1,0,0,0,0,0,1,1,1,1,0],			
			[0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],		
			[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],	];	

			
window.onload=function() {	
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	CANVAS_WIDTH = canvas.width;
	CANVAS_HEIGHT = canvas.height;
	COLS = obstacle_grid.length;
	ROWS = obstacle_grid[0].length;
	CELL_WIDTH = CANVAS_WIDTH/COLS;
	CELL_HEIGHT = CANVAS_HEIGHT/ROWS;
	
	problem = new BasicSearchProblem(obstacle_grid);
	
	draw_grid(obstacle_grid, COLS, ROWS);
}

function clicked(event) {
	var mouseX, mouseY;

    if(event.offsetX) {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
    }
    else if(event.layerX) {
        mouseX = event.layerX-canvas.offsetLeft;
        mouseY = event.layerY-canvas.offsetTop;
    }

	var cur_pos = problem.create_pos(
		Math.round(mouseX/CELL_WIDTH - .5), 
		Math.round(mouseY/CELL_HEIGHT - .5),
		0
	);
	
	if (obstacle_grid[cur_pos.x][cur_pos.y])
		return;
	
	if (!has_clicked) {
		first_pos = cur_pos;
		
		context.fillStyle = "lightBlue";
		context.fillRect(first_pos.x*CELL_WIDTH, first_pos.y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
			
		has_clicked = true;
	} else if (has_clicked) {
		last_pos = cur_pos;
		
		var data_grid = create_zeroed_grid(COLS, ROWS);
		var path = astar(first_pos, last_pos, problem, data_grid);
		draw_grid(obstacle_grid, COLS, ROWS);
		draw_search_result(data_grid, first_pos, last_pos, COLS, ROWS);
		if(path != null) {
			var point_list = to_point_list(problem, first_pos, path);
			draw_point_lists(point_list);
		}
		
		has_clicked = false;
	}
}

function create_zeroed_grid(cols, rows) {
	var grid = new Array(cols);
	for(var x = 0; x < cols; x++) {
		grid[x] = new Array(rows);
		for(var y = 0; y < rows; y++) {
			grid[x][y] = 0;
		}
	}
	return grid;
}

function print_grid() {
	var prefix1 = "";
	var str = "[";
	for(var x = 0; x < COLS; x++) {
		str += prefix1+"[";
		var prefix2 = "";
		for(var y = 0; y < ROWS; y++) {
			str += prefix2+obstacle_grid[x][y];
			prefix2 = ",";
		}
		str += "]";
		prefix1 = ",\n";
	}
	str += "]";
	console.log(str);
}






























