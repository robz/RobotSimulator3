var sin = Math.sin, cos = Math.cos, abs = Math.abs;

var map_rows = 60,
    map_cols = 60;

function MapBuilder(x, y, heading, width) {
	this.pos = {x:x, y:y};
    this.heading = heading;
    this.width = width;

    col_inc = CANVAS_WIDTH/map_cols;
    row_inc = CANVAS_HEIGHT/map_rows;

    grid = new Array(map_rows);
    for (var r = 0; r < map_rows; r++) {
        grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            grid[r][c] = 0;
        }
    }
	
    temp_grid = new Array(map_rows);
    for (var r = 0; r < map_rows; r++) {
        temp_grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            temp_grid[r][c] = 0;
        }
    }
	
	this.visited_grid = new Array(map_rows);
	var visited_grid = this.visited_grid;
    for (var r = 0; r < map_rows; r++) {
        visited_grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            visited_grid[r][c] = 0;
        }
    }
	
	this.gridtracer = new Gridtracer(map_rows, map_cols, col_inc, row_inc);

    this.update_map = function(lidar) {
		for (var r = 0; r < map_rows; r++) {
			for (var c = 0; c < map_cols; c++) {
				temp_grid[r][c] = 0;
				visited_grid[r][c] = 0;
			}
		}
	
		for (var i = 0; i < lidar.num_angles; i++) {
            var mag = lidar.val[i],
				angle = this.heading + lidar.start_angle + lidar.inc*i,
                point_x = this.pos.x + mag*cos(angle),
                point_y = this.pos.y + mag*sin(angle),
                col = Math.floor(point_x/col_inc),
                row = Math.floor(point_y/row_inc);
				
			if (row >= 0 && row < map_rows && col >= 0 && col < map_cols) {
				if (mag < lidar.MAX_VAL - 1) {
					grid[row][col] += 2;
					if (grid[row][col] > 9) {
						grid[row][col] = 9;
					}
				}
				
				temp_grid[row][col] = 1;
			}
				
			this.gridtracer.trace(this.pos, angle, temp_grid, 
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
	
	this.update_state = function(Vl, Vr, dt) {
		var x = this.pos.x, y = this.pos.y, theta = this.heading, L = this.width;
        var new_x, new_y, new_heading;

        if (abs(Vl - Vr) < .00001) {
            new_x = x + Vl*dt*cos(theta);
            new_y = y + Vl*dt*sin(theta);
            new_heading = theta;
        } else {
            // Credit: Dudek and Jenkin, Computational Principles of Mobile Robotics
            var R = L*(Vl + Vr)/(2*(Vr - Vl)),
                wd = dt*(Vr - Vl)/L;
            new_x = x + R*cos(wd)*sin(theta) + R*sin(wd)*cos(theta) - R*sin(theta);
            new_y = y + R*sin(wd)*sin(theta) - R*cos(wd)*cos(theta) + R*cos(theta);
            new_heading = theta + wd;
        }

        new_heading = new_heading%(2*PI);

        this.pos.x = new_x;
        this.pos.y = new_y;
        this.heading = new_heading;
	};

    this.update = function(Vl, Vr, lidar, dt) {
		this.update_state(Vl, Vr, dt);
        this.update_map(lidar);
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
					context.fillText(grid[r][c]+"", c*col_inc, r*row_inc + row_inc);
                }
				
                if (visited_grid[r][c] == 1) {
					context.fillStyle = "lightGreen";
					context.fillRect(c*col_inc, r*row_inc, col_inc, row_inc);
                } 
            }
        }

        context.fillStyle = "blue";
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, 4, 0, Math.PI*2, false);
        context.fill();

        context.strokeStyle = "blue";
        context.beginPath();
        context.moveTo(this.pos.x, this.pos.y);
        context.lineTo(this.pos.x + 20*Math.cos(this.heading), 
                       this.pos.y + 20*Math.sin(this.heading));
        context.stroke();
    };
}
