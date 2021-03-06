var PI = Math.PI,
	TWO_PI = 2*PI,
	HALF_PI = PI/2;

function Raytracer(cols, rows, cell_width, cell_height, obstacles) {
    var points = new Array((rows+1)*(cols+1)),
        col_segs = new Array(rows),
        row_segs = new Array(cols),
        boxes = new Array(rows*cols);
    
    for (var r = 0; r < rows+1; r++) {
        points[r] = new Array(cols+1);
        for (var c = 0; c < cols+1; c++) {
            points[r][c] = create_point(c*cell_width, r*cell_height);
        }
    }
    
    for (var r = 0; r < rows; r++) {
        col_segs[r] = new Array(cols+1);
        for (var c = 0; c < cols+1; c++) {
            col_segs[r][c] = create_line(points[r][c], points[r+1][c]);
        }
    }
    
    for (var c = 0; c < cols; c++) {
        row_segs[c] = new Array(rows+1);
        for (var r = 0; r < rows+1; r++) {
            row_segs[c][r] = create_line(points[r][c], points[r][c+1]);
        }
    }
    
    for (var r = 0; r < rows; r++) {
        boxes[r] = new Array(cols);
        for (var c = 0; c < cols; c++) {
            var x = c*cell_width, 
                y = r*cell_height;
            boxes[r][c] = new RTBox(x, y, cell_width, cell_height, r, c);
        }
    }
    
    var dir_difs = [[0,-1],[0,1],[-1,0],[1,0]];
    
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
			var box = boxes[r][c],
				segs = [col_segs[r][c], col_segs[r][c+1], row_segs[c][r], row_segs[c][r+1]],
                adj_boxes = new Array(4);
            
            for (var i = 0; i < dir_difs.length; i++) {
                var dir_dif = dir_difs[i],
                    new_r = r + dir_dif[0],
                    new_c = c + dir_dif[1];
		
                if (new_r >= rows || new_c >= cols || new_r < 0 || new_c < 0) {
                    adj_boxes[i] = null;
                } else {
                    adj_boxes[i] = boxes[new_r][new_c];
                }
            }
            
			if (obstacles) {
                var edges = new Array();
				
				for (var i = 0; i < obstacles.length; i++) {
					var obst_poly = obstacles[i].polygon,
						numlines = obst_poly.lines.length;
						
					for (var j = 0; j < numlines; j++) {
						var obst_poly_line = obst_poly.lines[j];
					
						for (var k = 0; k < 4; k++) {
							if (lineSegmentIntersection(obst_poly_line, segs[k])
							 || box.containsPoint(obst_poly_line.p1)) {                    
								edges.push(obst_poly_line);
								break;
							}
						}
					}
				}
				
				box.edges = edges;
			}
            
            box.segments = segs;
            box.adj_boxes = adj_boxes;
        }
    }
	
	var index_list = [
		[3, 1],
		[0, 3],
		[2, 0],
		[2, 1]
	];
	
	var intersection = create_point(null, null),
		closest_intersection = create_point(null, null),
		temp_point = create_point(null, null),
		temp_ray = create_line(create_point(0,0), create_point(0,0));

	//
	// returns false: if the next-box couldn't be found (error)
	//		   null: if the next-box is outside of the world
	//         next-box: otherwise; and sets intersection
	//
	var getNextBox = function(ray, box, intersection, indexes) {
		var next_box = false,
			theta = ray.theta,
			
			segments = box.segments,
			adj_boxes = box.adj_boxes;
		
		for (var i = 0; i < indexes.length; i++) {
			var index = indexes[i],
				res = inplace_lineSegmentIntersection(ray, segments[index], temp_point);
			
			if (0 == res) {
				intersection.x = temp_point.x;
				intersection.y = temp_point.y;
				
				next_box = adj_boxes[index];
			
				break;
			} else {
			
			}
		}
		
		return next_box;
	};
    
    this.trace_field = function(start_point, heading, max_dist, closest_intersection) {
		var row = Math.round(start_point.y/cell_height - .5),
			col = Math.round(start_point.x/cell_width - .5),
			box = boxes[row][col],
			
			closest_dist = max_dist,
			
			indexes = index_list[0],
			theta = (heading%TWO_PI + TWO_PI)%TWO_PI;
		
		if (theta > 0) {
			indexes = index_list[Math.ceil(theta/HALF_PI)-1];
		}
		
		inplace_create_line_from_vector(start_point, theta, 10000, temp_ray, true);
			
		intersection.x = start_point.x;
		intersection.y = start_point.y;
		closest_intersection.x = null;
		closest_intersection.y = null;
		temp_point.x = null;
		temp_point.y = null;
		
		while (box && !box.out_of_range(start_point, max_dist)) {
			temp_ray.p1 = intersection;
			edges = box.edges;
			
			for (var i = 0; i < edges.length; i++) {
				var res = inplace_lineSegmentIntersection(temp_ray, edges[i], temp_point);
				
				if (res == 0) {
					var dist = euclidDist(temp_point, start_point);
					
					if (dist < closest_dist) {
						closest_intersection.x = temp_point.x;
						closest_intersection.y = temp_point.y;
						closest_dist = dist;
					}
				}
			}
		
			box = getNextBox(temp_ray, box, intersection, indexes);
		}
		
		if (false == box) {
			console.log("yo we got an error up in this raytracing joint.");
			return null;
		}
		
		if (!closest_intersection.x) {
			closest_intersection.x = start_point.x + max_dist*Math.cos(heading),
			closest_intersection.y = start_point.y + max_dist*Math.sin(heading);
		}
		
		return closest_intersection;
	};
	
	//
	// takes in:
	//	a starting point and direction
	//	an occupancy grid EQUAL IN SIZE SPECIFIED in the constructor above
	//  a callback that will be called with the (row, col) of every empty gridcell encountered
	//  a callback that will be called with the (row, col) of every occupied gridcell encountered
	// returns whether it encountered an occupied gridcell
	//
	this.trace_grid = function(start_point, heading, occupancy_grid, unset_callback, set_callback, intersection_callback) {
		var row = Math.round(start_point.y/cell_height - .5),
			col = Math.round(start_point.x/cell_width - .5),
			box = boxes[row][col],
			
			indexes = index_list[0],
			theta = (heading%TWO_PI + TWO_PI)%TWO_PI;
		
		if (theta > 0) {
			indexes = index_list[Math.ceil(theta/HALF_PI)-1];
		}
		
		inplace_create_line_from_vector(start_point, theta, 10000, temp_ray, true),
			
		intersection.x = start_point.x;
		intersection.y = start_point.y;
		
		while (box) {
			row = box.row;
			col = box.col;
			temp_ray.p1 = intersection;
			
			if (intersection_callback) {
				intersection_callback(temp_ray.p1);
			}
			
			if (1 == occupancy_grid[row][col]) {
				if (set_callback) {
					set_callback(row, col);
				}
				
				return true;
			} else if (unset_callback && 0 == occupancy_grid[row][col]) {
				unset_callback(row, col);
			}
			
			box = getNextBox(temp_ray, box, intersection, indexes);
		}
		
		if (false == box) {
			console.log("yo we got an error up in this raytracing joint.");
			return null;
		}
		
		return false;
	};
	
	this.draw = function(context) {
		context.strokeStyle = "black";
		
		for (var r = 0; r < rows+1; r++) {
			draw_line(context, points[r][0], points[r][cols]);
		}
		
		for (var c = 0; c < cols+1; c++) {
			draw_line(context, points[0][c], points[rows][c]);
		}
		
		if (obstacles) {
			context.fillStyle = "black";
			for (var r = 0; r < rows; r++) {
				for (var c = 0; c < cols; c++) {
					context.fillText(""+boxes[r][c].edges.length, 
									 c*cell_width+cell_width/2, 
									 r*cell_height+cell_height/2);
				}
			}
		}
	};
}

function RTBox(x, y, width, height, row, col) {
    this.segments = null;
    this.adj_boxes = null;
    this.edges = null;
	this.row = row;
	this.col = col;
    
    this.containsPoint = function(p) {
	    return p.x >= x && p.x <= x+width && p.y >= y && p.y <= y+height;
    };
	
	var dist_within = 3*(width*width + height*height);
	
	this.out_of_range = function(p, d) {
		var dx = p.x - x,
			dy = p.y - y;
		return dx*dx + dy*dy > d*d + dist_within;
	};
}

function draw_line(context, p1, p2) {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}