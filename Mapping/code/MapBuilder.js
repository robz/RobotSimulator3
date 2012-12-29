var sin = Math.sin, cos = Math.cos, abs = Math.abs;

var map_rows = 100,
    map_cols = 100;

function MapBuilder(x, y, heading, width) {
    this.x = x;
    this.y = y;
    this.heading = heading;
    this.width = width;

    this.col_inc = CANVAS_WIDTH/map_cols;
    this.row_inc = CANVAS_HEIGHT/map_rows;

    this.grid = new Array(map_rows);
    for (var r = 0; r < map_rows; r++) {
        this.grid[r] = new Array(map_cols);
        for (var c = 0; c < map_cols; c++) {
            this.grid[r][c] = 0;
        }
    }

    this.update_map = function(lidar) {
		for (var r = 0; r < map_rows; r++) {
			for (var c = 0; c < map_cols; c++) {
				//this.grid[r][c] = 0;
			}
		}
	
		for (var i = 0; i < lidar.num_angles; i++) {
            var mag = lidar.val[i];

            if (mag < lidar.MAX_VAL-1) {
                var angle = this.heading + lidar.start_angle + lidar.inc*i,
                    point_x = this.x + mag*cos(angle),
                    point_y = this.y + mag*sin(angle),
                    col = Math.floor(point_x/this.col_inc),
                    row = Math.floor(point_y/this.row_inc);
				
				try {
					this.grid[row][col] += 1;
					
					if (this.grid[row][col] > 5) {
						this.grid[row][col] = 5;
					}
				} catch (e) {
					console.log(row, col);
				}
            }
        }
    };
	
	this.update_state = function(Vl, Vr, dt) {
		var x = this.x, y = this.y, theta = this.heading, L = this.width;
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

        this.x = new_x;
        this.y = new_y;
        this.heading = new_heading;
	}

    this.update = function(Vl, Vr, lidar, dt) {
		this.update_state(Vl, Vr, dt);
        this.update_map(lidar);
    };

    this.draw = function(context) {
        // context.fillStyle = "#FFFFFF";
        for (var r = 0; r < map_rows; r++) {
            for (var c = 0; c < map_cols; c++) {
                if (this.grid[r][c] > 0) {
					var num = 18*7 - 18*(this.grid[r][c]+1);
					context.fillStyle = "#"+num+"0000";
					context.fillRect(c*this.col_inc, r*this.row_inc, this.col_inc, this.row_inc);
                }
            }
        }

        context.fillStyle = "blue";
        context.beginPath();
        context.arc(this.x, this.y, 4, 0, Math.PI*2, false);
        context.fill();

        context.strokeStyle = "blue";
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + 20*Math.cos(this.heading), 
                       this.y + 20*Math.sin(this.heading));
        context.stroke();
    };
}
