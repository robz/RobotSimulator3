var sin = Math.sin, cos = Math.cos, abs = Math.abs;

var MAX_CELL_VAL = 255;

function MapBuilder(x, y, heading, width, map_rows, map_cols) {
	var state = {pos:{x:x,y:y},heading:heading},
		grid = new Array(map_rows),
		temp_grid = new Array(map_rows),
		visited_grid = new Array(map_rows),
		col_inc = CANVAS_WIDTH/map_cols,
		row_inc = CANVAS_HEIGHT/map_rows,
		raytracer = new Raytracer(map_rows, map_cols, col_inc, row_inc);
	
    for (var r = 0; r < map_rows; r++) {
        grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            grid[r][c] = 0;
        }
    }
	
    for (var r = 0; r < map_rows; r++) {
        temp_grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            temp_grid[r][c] = 0;
        }
    }
	
    for (var r = 0; r < map_rows; r++) {
        visited_grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            visited_grid[r][c] = 0;
        }
    }

    var update_map = function(lidar) {
		var pos = state.pos,
			x = state.pos.x,
			y = state.pos.y,
			heading = state.heading,
			start_angle = lidar.start_angle,
			inc = lidar.inc;
	
		for (var r = 0; r < map_rows; r++) {
			for (var c = 0; c < map_cols; c++) {
				temp_grid[r][c] = 0;
				visited_grid[r][c] = 0;
			}
		}
	
		for (var i = 0; i < lidar.num_angles; i++) {
            var mag = lidar.val[i],
				angle = heading + start_angle + inc*i + .00001, // .00001 == HACK!!!
                point_x = x + mag*cos(angle),
                point_y = y + mag*sin(angle),
                col = Math.floor(point_x/col_inc),
                row = Math.floor(point_y/row_inc);
				
			if (row >= 0 && row < map_rows && col >= 0 && col < map_cols) {
				if (mag < lidar.MAX_VAL - 1) {
					grid[row][col] += 2;
					if (grid[row][col] > MAX_CELL_VAL) {
						grid[row][col] = MAX_CELL_VAL;
					}
				}
				
				temp_grid[row][col] = 1;
			}
				
			raytracer.trace_grid(pos, angle, temp_grid, 
				function(r, c) {
					visited_grid[r][c] = 1;
					
					grid[r][c] -= 1;
					if (grid[r][c] < 0) {
						grid[r][c] = 0;
					}
				},
				function(r, c) {
					visited_grid[r][c] = 2;
				}
			);
		}
    };
	
	var update_state = function(Vl, Vr, dt) {
		var x = state.pos.x, y = state.pos.y, theta = state.heading, L = width;
        var new_x, new_y, new_heading;

        if (abs(Vl - Vr) < .00001) {
            new_x = x + Vl*dt*cos(theta);
            new_y = y + Vl*dt*sin(theta);
            new_heading = theta;
        } else {
            // Credit: Dudek and Jenkin, Computational Principles of Mobile Robotics
            var R = L*(Vl + Vr)/(2*(Vr - Vl)),
                wd = dt*(Vr - Vl)/L;
			new_x = x + R*sin(wd + theta) - R*sin(theta);
			new_y = y - R*cos(wd + theta) + R*cos(theta);
            new_heading = theta + wd;
        }

        new_heading = new_heading%(2*PI);

        state.pos.x = new_x;
        state.pos.y = new_y;
        state.heading = new_heading;
	};

    this.update = function(Vl, Vr, lidar, dt) {
		update_state(Vl, Vr, dt);
        update_map(lidar);
    };

    this.draw = function(context) {
        context.fillStyle = "black";
		context.fillStyle = "lightGreen";
        for (var r = 0; r < map_rows; r++) {
            for (var c = 0; c < map_cols; c++) {
				if (grid[r][c] > 0) {
					context.fillStyle = "black";
					context.fillRect(c*col_inc, r*row_inc, col_inc, row_inc);
					context.fillStyle = "white";
					context.fillText(Math.floor(9*grid[r][c]/(MAX_CELL_VAL))+"", c*col_inc, r*row_inc + row_inc);
                }
				
                if (visited_grid[r][c] == 1) {
					context.fillStyle = "lightGreen";
					context.fillRect(c*col_inc, r*row_inc, col_inc, row_inc);
                } else if (visited_grid[r][c] == 2) {
					context.fillStyle = "lightBlue";
					context.fillRect(c*col_inc, r*row_inc, col_inc, row_inc);
                } 
            }
        }

        context.fillStyle = "blue";
        context.beginPath();
        context.arc(state.pos.x, state.pos.y, 4, 0, Math.PI*2, false);
        context.fill();

        context.strokeStyle = "blue";
        context.beginPath();
        context.moveTo(state.pos.x, state.pos.y);
        context.lineTo(state.pos.x + 20*cos(state.heading), 
                       state.pos.y + 20*sin(state.heading));
        context.stroke();
    };
}
