var old_error, pid_sum = 0;

function followPath_Tank() {
	var p = 4, d = .01, i = 0;
	
	if (path_lines && path_lines.length > 0) 
	{
		var dest = path_lines[path_lines.length-1].p2;
		if (euclidDist(create_point(robot.x, robot.y), dest) < 20) {
			path_lines = null;
			pid_goal = null;
			return;
		}
		
		var error = getCrossCheckError(robot, path_lines);
		if (!error) {
			return;
		}
		
		if (!old_error) {
			old_error = error;
		}
		
		var delta_steering_angle = -p*error + -d*(error - old_error) + -i*pid_sum;
		old_error = error;
		pid_sum += error;
		
		var new_wheel1_vel = 0, new_wheel2_vel = 0;
		
		if (delta_steering_angle > 0) {
			
			new_wheel1_vel = MAX_V - MAX_V*delta_steering_angle/PI;
			if (new_wheel1_vel > MAX_V) {
				new_wheel1_vel = MAX_V;
			} else if (new_wheel1_vel < -MAX_V) {
				new_wheel1_vel = -MAX_V;
			}
			
			new_wheel2_vel = MAX_V;
			
		} else if (delta_steering_angle < 0) {
			new_wheel1_vel = MAX_V;
			
			new_wheel2_vel = MAX_V + MAX_V*delta_steering_angle/PI;
			
			if (new_wheel2_vel > MAX_V) {
				new_wheel2_vel = MAX_V;
			}else if (new_wheel2_vel < -MAX_V) {
				new_wheel2_vel = -MAX_V;
			}
		} else {
			new_wheel1_vel = MAX_V;
			new_wheel2_vel = MAX_V;	
		}
		
		robot.wheel1_velocity = new_wheel1_vel;
		robot.wheel2_velocity = new_wheel2_vel;
		
	} else {
		robot.wheel1_velocity = 0;
		robot.wheel2_velocity = 0;
	}
}

function followPath_Ackerman() {
	var p = .7, d = 2, i = .000;
	
	if (path_lines && path_lines.length > 0) 
	{
		var dest = path_lines[path_lines.length-1].p2;
		if (euclidDist(create_point(robot.x, robot.y), dest) < 20) {
			path_lines = null;
			pid_goal = null;
			return;
		}
	
		if (robot.velocity < MAX_V) {
			robot.accelerate(DELTA_V);
		}
		
		var error = getCrossCheckError(robot, path_lines);
		if (!error) {
			return;
		}
		
		if (!old_error) {
			old_error = error;
		}
		
		var delta_steering_angle = -p*error + -d*(error - old_error) + -i*pid_sum;
		old_error = error;
		pid_sum += error;
		
		if (delta_steering_angle != 0) {
			robot.steer(delta_steering_angle);
		} 
	} else {
		if (robot.velocity > 0) {
			robot.accelerate(-DELTA_V);
		}
	}
}

function getCrossCheckError(robot, lines) {
	var radius = robot.length+10;
	var circle = create_circle(create_point(robot.x, robot.y), radius);
	var p = false;
	
	for (var i = 0; i < lines.length; i++) {
		var p = dirLineSegCircleIntersection(lines[i], circle);
		if (p) {
			break;
		}
	}
	
	if (!p) {
		return false;
	}
	
	pid_goal = create_circle(p, 2);
	
	var line_heading = my_atan(p.y-robot.y, p.x-robot.x);
	var res = robot.heading - line_heading;
	
	if (res > Math.PI) {
		res = res - 2*Math.PI;
	} else if (res < -Math.PI) {
		res = res + 2*Math.PI;
	}
	
	return res;
}
