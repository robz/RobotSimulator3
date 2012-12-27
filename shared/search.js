function BigGridSearchProblem(obstacle_grid) 
{
	this.obstacle_grid = obstacle_grid;
	this.COLS = obstacle_grid.length;
	this.ROWS = obstacle_grid[0].length;
	
	// up, down, left, right, diagonals
	this.surrounding_deltas = [
		{deltax: 1, deltay: 0},
		{deltax: 0, deltay: 1},
		{deltax:-1, deltay: 0},
		{deltax: 0, deltay:-1},
		{deltax:-1, deltay:-1},
		{deltax:-1, deltay: 1},
		{deltax: 1, deltay:-1},
		{deltax: 1, deltay: 1}
	];
	
	this.actions = [ { deltax: 0, deltay:-1, cost:1, next_valid_deltas:this.surrounding_deltas },
					 { deltax: 0, deltay: 1, cost:1, next_valid_deltas:this.surrounding_deltas },
					 { deltax:-1, deltay: 0, cost:1, next_valid_deltas:this.surrounding_deltas },
					 { deltax: 1, deltay: 0, cost:1, next_valid_deltas:this.surrounding_deltas },
					 { deltax: 1, deltay: 1, cost:Math.sqrt(2), next_valid_deltas:this.surrounding_deltas },
					 { deltax:-1, deltay: 1, cost:Math.sqrt(2), next_valid_deltas:this.surrounding_deltas },
					 { deltax: 1, deltay:-1, cost:Math.sqrt(2), next_valid_deltas:this.surrounding_deltas },
					 { deltax:-1, deltay:-1, cost:Math.sqrt(2), next_valid_deltas:this.surrounding_deltas }];
	
	this.next_pos = function(pos, action_index) {
		var action = this.actions[action_index];
	
		var new_pos = this.create_pos(pos.x + action.deltax, 
									  pos.y + action.deltay);
		
		if (this.is_valid_pos(new_pos)) {
			var deltas = action.next_valid_deltas;
			if (deltas) {
				for(var i = 0; i < deltas.length; i++) {
					var other_pos = this.create_pos(new_pos.x + deltas[i].deltax, 
													new_pos.y + deltas[i].deltay);
					if (!this.is_valid_pos(other_pos)) {
						return null;
					}
				}
			}
			return new_pos;
		} 
		
		return null;
	};

	this.is_valid_pos = function(pos) {
		return pos.x >= 0 && pos.y >= 0 && pos.x < this.COLS && pos.y < this.ROWS
			&& 0 == this.obstacle_grid[pos.x][pos.y];
	};
	
	this.create_pos = function(x, y) {
		return {
			x: x,
			y: y,
			ID: x + y*this.COLS
		};
	}
	
	this.create_state = function(pos, cost, heuristicVal) {
		return {
			pos: pos,
			heuristicVal: heuristicVal,
			cost: cost,
			totalCost: cost + heuristicVal,
			path: []
		};
	};
	
	this.is_goal = function(state, goal) {
		return state.pos.x == goal.x && state.pos.y == goal.y;
	};
	
	this.heuristic = shortcut_heuristic;
}

function BasicSearchProblem(obstacle_grid) 
{
	this.obstacle_grid = obstacle_grid;
	this.COLS = obstacle_grid.length;
	this.ROWS = obstacle_grid[0].length;
	
	// up, down, left, right, diagonals
	this.actions = [ { deltax: 0, deltay:-1, cost:1 },
					 { deltax: 0, deltay: 1, cost:1 },
					 { deltax:-1, deltay: 0, cost:1 },
					 { deltax: 1, deltay: 0, cost:1 },
					 { deltax: 1, deltay: 1, cost:Math.sqrt(2), next_valid_deltas:[{deltax:-1, deltay: 0}, {deltax: 0, deltay:-1}] },
					 { deltax:-1, deltay: 1, cost:Math.sqrt(2), next_valid_deltas:[{deltax: 1, deltay: 0}, {deltax: 0, deltay:-1}] },
					 { deltax: 1, deltay:-1, cost:Math.sqrt(2), next_valid_deltas:[{deltax:-1, deltay: 0}, {deltax: 0, deltay: 1}] },
					 { deltax:-1, deltay:-1, cost:Math.sqrt(2), next_valid_deltas:[{deltax: 1, deltay: 0}, {deltax: 0, deltay: 1}] },];
	
	this.next_pos = function(pos, action_index) {
		var action = this.actions[action_index];
	
		var new_pos = this.create_pos(pos.x + action.deltax, 
									  pos.y + action.deltay);
		
		if (this.is_valid_pos(new_pos)) {
			var deltas = action.next_valid_deltas;
			if (deltas) {
				for(var i = 0; i < deltas.length; i++) {
					var other_pos = this.create_pos(new_pos.x + deltas[i].deltax, 
													new_pos.y + deltas[i].deltay);
					if (!this.is_valid_pos(other_pos)) {
						return null;
					}
				}
			}
			return new_pos;
		} 
		
		return null;
	};

	this.is_valid_pos = function(pos) {
		return pos.x >= 0 && pos.y >= 0 && pos.x < this.COLS && pos.y < this.ROWS
			&& 0 == this.obstacle_grid[pos.x][pos.y];
	};
	
	this.create_pos = function(x, y) {
		return {
			x: x,
			y: y,
			ID: x + y*this.COLS
		};
	}
	
	this.create_state = function(pos, cost, heuristicVal) {
		return {
			pos: pos,
			heuristicVal: heuristicVal,
			cost: cost,
			totalCost: cost + heuristicVal,
			path: []
		};
	};
	
	this.is_goal = function(state, goal) {
		return state.pos.x == goal.x && state.pos.y == goal.y;
	};
	
	this.heuristic = manhattan_heuristic;//shortcut_heuristic;
}

function astar(start_pos, goal_pos, problem, disp_grid) 
{
	var cur_state = problem.create_state(start_pos, 0, problem.heuristic(start_pos, goal_pos));
	var visited = {}, queue = [];
	
	visited[cur_state.pos.ID] = cur_state.totalCost;
	if (disp_grid) {
		disp_grid[cur_state.pos.x][cur_state.pos.y] = { c: cur_state.cost, h: cur_state.heuristicVal };
	}
	
	while (!problem.is_goal(cur_state, goal_pos)) 
	{
		for (var index = 0; index < problem.actions.length; index++)
		{
			var new_pos = problem.next_pos(cur_state.pos, index);
							
			if (new_pos) 
			{
				var new_state = problem.create_state(
									new_pos, 
									cur_state.cost + problem.actions[index].cost, 
									problem.heuristic(new_pos, goal_pos) );
									
				if (!visited[new_pos.ID] || visited[new_pos.ID] > new_state.totalCost) 
				{
					visited[new_pos.ID] = new_state.totalCost;
					new_state.path = copy_path(cur_state.path);
					new_state.path.push(index);
					queue.push(new_state);
				}
			}
		}
		
		queue.sort(function (a,b) { return a.totalCost - b.totalCost; });
		
		if (0 == queue.length) {
			return null;
		} 
		cur_state = queue.shift();
		
		if (disp_grid) {
			disp_grid[cur_state.pos.x][cur_state.pos.y] = { c: cur_state.cost, h: cur_state.heuristicVal };
		}
	}
	
	return cur_state.path;
}

//
// Heuristics
//

function manhattan_heuristic(pos, goal) {
	return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
}

function euclidean_heuristic(pos, goal) {
	return Math.sqrt((pos.x - goal.x)*(pos.x - goal.x) 					   
				   + (pos.y - goal.y)*(pos.y - goal.y));
}
	
// "shortcut" = manhattan incorporating 45 degree diagonals
function shortcut_heuristic(pos, goal) {
	var dx = Math.abs(pos.x - goal.x),
		dy = Math.abs(pos.y - goal.y),
		min = (dx < dy) ? dx : dy,
		max = (dx > dy) ? dx : dy;
		
	return Math.sqrt(2*min*min) + (max-min);
}

//
// Utility functions
//

function copy_path(path) {
	var new_path = new Array(path.length);
	
	for (var i = 0; i < path.length; i++) {
		new_path[i] = path[i];
	}
	
	return new_path;
}

// takes in a path (a list of actions)
// returns a point_list (a list of points)
function to_point_list(problem, start_pos, path) {
	var point_list = new Array(path.length+1);
	
	point_list[0] = problem.create_pos(start_pos.x, start_pos.y, start_pos.dir);
	
	for(var i = 1; i < point_list.length; i++) {
		point_list[i] = problem.next_pos(point_list[i-1], path[i-1]);
	}
	
	for(var i = 0; i < point_list.length; i++) {
		point_list[i].x *= CELL_WIDTH;
		point_list[i].x += CELL_WIDTH/2;
		point_list[i].y *= CELL_HEIGHT;
		point_list[i].y += CELL_HEIGHT/2;
	}
	
	return point_list;
}

// Credit: Sebastian Thrun, How to Design a Robotic Car, Udacity
function smooth_path(point_list) {
	var new_list = new Array(point_list.length);
	
	for (i = 0; i < point_list.length; i++) {
		new_list[i] = {x:point_list[i].x,y:point_list[i].y};
	}
	
	var weight_data = .5, weight_smooth = .2;
	var tolerance = .0001, delta = 1;
	
    while (delta > tolerance) {
        delta = 0;
		
        for (i = 1; i < point_list.length-1; i++) { 
            var old1 = new_list[i].x,
				old2 = new_list[i].y;
            
            new_list[i].x += weight_data*(point_list[i].x - new_list[i].x);
            new_list[i].y += weight_data*(point_list[i].y - new_list[i].y);
            
            new_list[i].x += weight_smooth*(new_list[i-1].x + new_list[i+1].x - 2*new_list[i].x);
            new_list[i].y += weight_smooth*(new_list[i-1].y + new_list[i+1].y - 2*new_list[i].y);
			
			if( i > 1 && i < point_list.length-2) {
				new_list[i].x += .5*weight_smooth*( 2*new_list[i-1].x - new_list[i-2].x - new_list[i].x )
				new_list[i].y += .5*weight_smooth*( 2*new_list[i-1].y - new_list[i-2].y - new_list[i].y )
					
				new_list[i].x += .5*weight_smooth*( 2*new_list[i+1].x - new_list[i+2].x - new_list[i].x )
				new_list[i].y += .5*weight_smooth*( 2*new_list[i+1].y - new_list[i+2].y - new_list[i].y )
			}
            
            delta += Math.abs(old1 - new_list[i].x);
            delta += Math.abs(old2 - new_list[i].y);
		}
	}
	
	return new_list;
}

// takes in a path (a list of actions)
// returns a rc_list (a list of rows/cols)
function to_rc_list(problem, start_pos, path) {
	var rc_list = new Array(path.length+1);
	
	rc_list[0] = problem.create_pos(start_pos.x, start_pos.y, start_pos.dir);
	
	for(var i = 1; i < rc_list.length; i++) {
		rc_list[i] = problem.next_pos(rc_list[i-1], path[i-1]);
	}
	
	return rc_list;
}

// takes in a list of row/cols
// returns a list of row/cols
function shortcut_rc_list(rc_list, obstacle_grid) {
	var new_list = [];
	
	new_list.push(rc_list[0]);
	
	var i = 0;
	while (i < rc_list.length - 1) {
		var j = i + 1;
		
		while (j < rc_list.length && is_valid_path(rc_list[i], rc_list[j], obstacle_grid)) {
			j++;
		}
		
		new_list.push(rc_list[j - 1]);
		i = j - 1;
	}
	
	return new_list;
}

var SHORTCUT_PADDING = Math.sqrt(2)/2 + .1;

function is_valid_path(p1, p2, obstacle_grid) {
	var minr, maxr, minc, maxc;
	
	if (p1.y < p2.y) {
		minr = p1.y;
		maxr = p2.y;
	} else {
		minr = p2.y;
		maxr = p1.y;
	}
	
	if (p1.x < p2.x) {
		minc = p1.x;
		maxc = p2.x;
	} else {
		minc = p2.x;
		maxc = p1.x;
	}
	
	var line = create_line(p1, p2);

	for (var r = minr; r <= maxr; r++) {
		for (var c = minc; c <= maxc; c++) {
			if (obstacle_grid[c][r] == 1) {
				if (line.isV) {
					if (Math.abs(c - line.b) <= SHORTCUT_PADDING) {
						return false;
					}
				} else {
					var minx = (c + r*line.m - line.m*line.b)/(line.m*line.m + 1),
						dist = Math.sqrt((c - minx)*(c - minx)
							+ (r - line.m*minx - line.b)*(r - line.m*minx - line.b));
					
					if (dist <= SHORTCUT_PADDING) {
						return false;
					}
				}
			}
		}
	}
	
	return true;
}

























