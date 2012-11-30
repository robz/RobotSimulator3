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
	
// "shortcut" = manhattan incorporating diagonals
function shortcut_heuristic(pos, goal) {
	var dx = Math.abs(pos.x - goal.x),
		dy = Math.abs(pos.y - goal.y);
	var min = (dx < dy) ? dx : dy,
		max = (dx > dy) ? dx : dy;
	return Math.sqrt(2*min*min) + (max-min);
}

//
// Logistics functions
//

function copy_path(path) {
	var new_path = new Array(path.length);
	for (var i = 0; i < path.length; i++) {
		new_path[i] = path[i];
	}
	return new_path;
}

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

function smooth_path(path) {
	var newpath = new Array(path.length);
	for (i = 0; i < path.length; i++) {
		newpath[i] = {x:path[i].x,y:path[i].y};
	}
	
	var weight_data = .5, weight_smooth = .2;
	var tolerance = .0001, delta = 1;
    while (delta > tolerance) {
        delta = 0;
        for (i = 1; i < path.length-1; i++) { 
            var old1 = newpath[i].x,
				old2 = newpath[i].y;
            
            newpath[i].x += weight_data*(path[i].x - newpath[i].x);
            newpath[i].y += weight_data*(path[i].y - newpath[i].y);
            
            newpath[i].x += weight_smooth*(newpath[i-1].x + newpath[i+1].x - 2*newpath[i].x);
            newpath[i].y += weight_smooth*(newpath[i-1].y + newpath[i+1].y - 2*newpath[i].y);
			
			if( i > 1 && i < path.length-2) {
				newpath[i].x += .5*weight_smooth*( 2*newpath[i-1].x - newpath[i-2].x - newpath[i].x )
				newpath[i].y += .5*weight_smooth*( 2*newpath[i-1].y - newpath[i-2].y - newpath[i].y )
					
				newpath[i].x += .5*weight_smooth*( 2*newpath[i+1].x - newpath[i+2].x - newpath[i].x )
				newpath[i].y += .5*weight_smooth*( 2*newpath[i+1].y - newpath[i+2].y - newpath[i].y )
			}
            
            delta += Math.abs(old1 - newpath[i].x);
            delta += Math.abs(old2 - newpath[i].y);
		}
	}
	return newpath;
}