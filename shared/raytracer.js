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
            boxes[r][c] = new RTBox(x, y, cell_width, cell_height);
        }
    }
    
    var dir_difs = [[0,-1],[0,1],[-1,0],[1,0]];
    
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            var segs = [col_segs[r][c], col_segs[r][c+1], row_segs[c][r], row_segs[c][r+1]],
                adj_boxes = new Array(dir_difs.length),
                edges = [];
            
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
            
            for (var i = 0; i < obstacles.length; i++) {
                for (var j = 0; j < obstacles[i].polygon.lines.length; j++) {
                    for (var k = 0; k < segs.length; k++) {
                        if (lineSegmentIntersection(obstacles[i].polygon.lines[j], segs[k])
                         || boxes[r][c].containsPoint(obstacles[i].polygon.lines[j].p1)) {                    
                            edges.push(obstacles[i].polygon.lines[j]);
                            break;
                        }
                    }
                }
            }
            
            boxes[r][c].segments = segs;
            boxes[r][c].adj_boxes = adj_boxes;
            boxes[r][c].edges = edges;
        }
    }

	//
	// returns false if no next-box is found
	//                 null if the next-box is outside of the world
	//                 next-box otherwise, then sets intersection
	//
	var getNextBox = function(ray, box, prev_box, intersection) {
		var next_box = false;
		var theta = (ray.theta%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
		
		indexes = [0, 2, 1, 3];
		
		if (theta >= 0 && theta <= Math.PI/2) {
			indexes = [3, 1, 0, 2];
		} else if (theta > Math.PI/2 && theta <= Math.PI) {
			indexes = [0, 3, 1, 2];
		} else if (theta > Math.PI && theta <= 3*Math.PI/2) {
			indexes = [2, 0, 1, 3];
		} else if (theta > 3*Math.PI/2 && theta <= 2*Math.PI) {
			indexes = [2, 1, 0, 3];
		} 
		
		for (var i = 0; i < box.segments.length; i++) {
			var index = indexes[i];
			var p = lineSegmentIntersection(ray, box.segments[index]);
			
			if (p) {
				intersection.x = p.x;
				intersection.y = p.y;
				
				next_box = box.adj_boxes[index];
				
				if (next_box != prev_box) {
					break;
				} else {
					next_box = false;
				}
			}
		}
		
		return next_box;
	};
    
    this.trace = function(start_point, heading, max_dist) {
		var row = Math.round(start_point.y/cell_height - .5),
			col = Math.round(start_point.x/cell_width - .5),
			box = boxes[row][col],
			prev_box = null,
			intersection = create_point(start_point.x, start_point.y);
				
		var count = rows + cols + 1;
		
		var closest_dist = max_dist,
			closest_intersection = null;
		
		while (box && count > 0) {
			var ray = create_line_from_vector(intersection, heading, 1000);
			
			for (var i = 0; i < box.edges.length; i++) {
				var p = lineSegmentIntersection(ray, box.edges[i]);
				if (p) {
					var dist = euclidDist(p, start_point);
					if (dist < closest_dist) {
						closest_intersection = p;
						closest_dist = dist;
					}
				}
			}
		
			new_box = getNextBox(ray, box, prev_box, intersection);
			prev_box = box;
			box = new_box;
			
			count--;
		}
		
		if (count == 0) {
			console.log("yo we got an error up in this raytracing joint.");
			return;
		}
		
		if (!closest_intersection) {
			var fx = start_point.x + max_dist*Math.cos(heading),
					fy = start_point.y + max_dist*Math.sin(heading);
			closest_intersection = create_point(fx, fy);
		}
		
		return closest_intersection;
	};
	
	this.draw = function(context) {
		context.strokeStyle = "black";
		
		for (var r = 0; r < rows+1; r++) {
			draw_line(context, points[r][0], points[r][cols]);
		}
		
		for (var c = 0; c < cols+1; c++) {
			draw_line(context, points[0][c], points[rows][c]);
		}
		
		context.fillStyle = "black";
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < cols; c++) {
				context.fillText(""+boxes[r][c].edges.length, 
								 c*cell_width+cell_width/2, 
								 r*cell_height+cell_height/2);
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
}

function draw_line(context, p1, p2) {
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

function Gridtracer(rows, cols, cell_width, cell_height) {
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
            boxes[r][c] = new RTBox(x, y, cell_width, cell_height);
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
            var segs = [col_segs[r][c], col_segs[r][c+1], row_segs[c][r], row_segs[c][r+1]],
                adj_boxes = new Array(dir_difs.length);
            
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
            
            boxes[r][c].segments = segs;
            boxes[r][c].adj_boxes = adj_boxes;
        }
    }

	//
	// returns false if no next-box is found
	//                 null if the next-box is outside of the world
	//                 next-box otherwise, then sets intersection
	//
	var getNextBox = function(ray, box, prev_box, intersection) {
		var next_box = false;
		var theta = (ray.theta%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
		
		indexes = [0, 2, 1, 3];
		
		if (theta >= 0 && theta <= Math.PI/2) {
			indexes = [3, 1, 0, 2];
		} else if (theta > Math.PI/2 && theta <= Math.PI) {
			indexes = [0, 3, 1, 2];
		} else if (theta > Math.PI && theta <= 3*Math.PI/2) {
			indexes = [2, 0, 1, 3];
		} else if (theta > 3*Math.PI/2 && theta <= 2*Math.PI) {
			indexes = [2, 1, 0, 3];
		} 
		
		for (var i = 0; i < box.segments.length; i++) {
			var index = indexes[i];
			var p = lineSegmentIntersection(ray, box.segments[index]);
			
			if (p) {
				intersection.x = p.x;
				intersection.y = p.y;
				
				next_box = box.adj_boxes[index];
				
				if (next_box != prev_box) {
					break;
				} else {
					next_box = false;
				}
			}
		}
		
		return next_box;
	};
    
	//
	// takes in:
	//	a starting point and direction
	//	an occupancy grid EQUAL IN SIZE SPECIFIED in the constructor above
	//  a callback that will be called with the (row, col) of every empty gridcell encountered
	//  a callback that will be called with the (row, col) of every occupied gridcell encountered
	// returns whether it encountered an occupied gridcell
	//
    this.trace = function(start_point, heading, occupancy_grid, unset_callback, set_callback) {
		if (occupancy_grid.length != rows || occupancy_grid[0].length != cols) {
			console.log("yoyoyo! afro! this grid is the wrong size, man!");
			return false;
		}
	
		var row = Math.round(start_point.y/cell_height - .5),
			col = Math.round(start_point.x/cell_width - .5),
			box = boxes[row][col],
			prev_box = null,
			intersection = create_point(start_point.x, start_point.y);
				
		var count = rows + cols + 1;
		
		while (box && count > 0) {
			var ray = create_line_from_vector(intersection, heading, 1000);
			
			if (occupancy_grid[box.row][box.col] == 1) {
				if (set_callback) {
					set_callback(box.row, box.col);
				}
				return true;
			} else if (unset_callback && occupancy_grid[box.row][box.col] == 0) {
				unset_callback(box.row, box.col);
			}
		
			new_box = getNextBox(ray, box, prev_box, intersection);
			prev_box = box;
			box = new_box;
			
			count--;
		}
		
		if (count == 0) {
			console.log("yo we got an off-the-grid error up in this raytracing joint.");
			return false;
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
	};
}