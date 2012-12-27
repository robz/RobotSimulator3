
function draw_search_result(data_grid, first_pos, last_pos, cols, rows) 
{
	for(var x = 0; x < cols; x++) {
		for(var y = 0; y < rows; y++) 
		{
			if((first_pos && x == first_pos.x && y == first_pos.y) ||
			   (last_pos && x == last_pos.x && y == last_pos.y)) 
			{
				context.fillStyle = "lightGreen";
				context.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
			}
			
			if(data_grid[x][y]) 
			{
				context.fillStyle = "black";
				context.fillText(
					""+Math.round(data_grid[x][y].h*100)/100, 
					x*CELL_WIDTH + 5, 
					y*CELL_HEIGHT + CELL_HEIGHT/3);
				context.fillText(
					""+Math.round(data_grid[x][y].c*100)/100, 
					x*CELL_WIDTH + 5, 
					y*CELL_HEIGHT + 2*CELL_HEIGHT/3);
			}
		}
	}
}

function draw_grid(obstacles, cols, rows) 
{
	context.fillStyle = "lightGray";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	context.strokeStyle = "white";
	context.fillStyle = "white";
	
	for(var x = 0; x < cols; x++) {
		context.beginPath();
		context.moveTo(x*CELL_WIDTH, 0);
		context.lineTo(x*CELL_WIDTH, CANVAS_HEIGHT);
		context.stroke();
		
		for(var y = 0; y < rows; y++) 
		{
			if(obstacles[x][y] == 1) {
				context.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
			}
		}
	}	
	
	for(var y = 0; y < rows; y++) {
		context.beginPath();
		context.moveTo(0, y*CELL_HEIGHT);
		context.lineTo(CANVAS_WIDTH, y*CELL_HEIGHT);
		context.stroke();
	}	
}

function draw_rc_list(rc_list) {
	context.lineWidth = 1;
	context.strokeStyle = "red";
	
	context.beginPath();
	context.moveTo(rc_list[0].x*CELL_WIDTH + CELL_WIDTH/2, 
		rc_list[0].y*CELL_HEIGHT + CELL_HEIGHT/2);
		
	for(var i = 1; i < rc_list.length; i++) {
		context.lineTo(rc_list[i].x*CELL_WIDTH + CELL_WIDTH/2, 
			rc_list[i].y*CELL_HEIGHT + CELL_HEIGHT/2);
	}
	
	context.stroke();
}

function draw_point_list(point_list) 
{
	context.lineWidth = 2;
	context.strokeStyle = "green";
	draw_lines(smooth_path(point_list));
	
	context.lineWidth = 1;
	context.strokeStyle = "purple";
	draw_lines(point_list);
}

function draw_lines(point_list) 
{
	context.beginPath();
	context.moveTo(point_list[0].x, point_list[0].y);
	for(var i = 1; i < point_list.length; i++) {
		context.lineTo(point_list[i].x, point_list[i].y);
	}
	context.stroke();
}