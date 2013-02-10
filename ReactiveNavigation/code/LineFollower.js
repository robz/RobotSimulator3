function create_lineFollower(robot) {
    var that = {},
        curLine,
        p = 4, d = .01, i = 0,
        old_error, pid_sum = 0,
        
        getCrossCheckError = function(robot, line) {
	        var radius = robot.length+10;
	        var circle = create_circle(create_point(robot.x, robot.y), radius);
	        var p = false;
	
	        var p = dirLineSegCircleIntersection(line, circle);
	
	        if (!p) {
		        return false;
	        }
	
	        pid_goal = create_circle(p, 2);
	
	        var line_heading = my_atan(p.y - robot.y, p.x - robot.x);
	        var res = robot.heading - line_heading;
	
	        if (res > Math.PI) {
		        res = res - 2*Math.PI;
	        } else if (res < -Math.PI) {
		        res = res + 2*Math.PI;
	        }
	
	        return res;
        };
    
    that.follow = function (newLine) {
        if (!newLine) {
            curLine = null;
        } else {
            curLine = create_line(
                create_point(newLine.p1.x, newLine.p1.y),
                create_point(newLine.p2.x, newLine.p2.y)
            );
        }
    };
    
    that.takeAction = function () {
	    if (curLine) 
	    {
		    var dest = curLine.p2;
		
		    var error = getCrossCheckError(robot, curLine);
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
			
			    new_wheel1_vel = MAX_V - MAX_V*delta_steering_angle/Math.PI;
			    if (new_wheel1_vel > MAX_V) {
				    new_wheel1_vel = MAX_V;
			    } else if (new_wheel1_vel < -MAX_V) {
				    new_wheel1_vel = -MAX_V;
			    }
			
			    new_wheel2_vel = MAX_V;
			
		    } else if (delta_steering_angle < 0) {
			    new_wheel1_vel = MAX_V;
			
			    new_wheel2_vel = MAX_V + MAX_V*delta_steering_angle/Math.PI;
			
			    if (new_wheel2_vel > MAX_V) {
				    new_wheel2_vel = MAX_V;
			    }else if (new_wheel2_vel < -MAX_V) {
				    new_wheel2_vel = -MAX_V;
			    }
		    } else {
			    new_wheel1_vel = MAX_V;
			    new_wheel2_vel = MAX_V;	
		    }
		
		    robot.wheel1_velocity = new_wheel1_vel/2;
		    robot.wheel2_velocity = new_wheel2_vel/2;
	    } else {
		    robot.wheel1_velocity = 0;
		    robot.wheel2_velocity = 0;
	    }
    };
    
    return that;
}
