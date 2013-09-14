/*
TODO:
- special case for continuing to pursue goals despite not enough clearance
- turning in place in the direction of the goal at the beginning
- turning 180 degrees in case of a dead end
- adding a bias weighting actions that would make the robot move in the same 
	direction as the last decision: this would possibly prevent thrashing
- fix clearance bug
- virtually shorten lidar scan to try and avoid hitting obstacles (believe that
	obstacles are closer than they actually are)
- add multiple directions for gaps that are large enough
*/

function create_controller(robot, lidar, lineFollower) {
    var that = {},
        endpoints, dirLines, lineResult,
        goalPos = null,
		turningTowardsGoal = false,
        
		LINE_LENGTH = lidar.MAX_VAL + 30,
        GOAL_THREASHOLD = 10,
		GOAL_DIR_THREASHOLD = Math.PI/10,
        MAX_VAL_NOISE_THREASHOLD = 1e-7,
        MINIMUM_CLEARANCE = robot.width + 10,
        WEIGHTS = {
            CLEARANCE: 0,
            HEADING_ALIGNMENT: .1,
            GOAL_ALIGNMENT: .6
        },
        
        angle_dif = function (a1, a2) {
            var d;
        
            a1 = (a1%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
            a2 = (a2%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
            d = Math.abs(a1 - a2);
            
            if (d > Math.PI) {
                d = 2*Math.PI - d;
            }
            
            return d;
        },
		
		calcClearance = function (curPos, angle1, dist1, angle2, dist2) {
			var dist = Math.min(dist1, dist2),
				p1 = create_point(curPos.x + dist*Math.cos(angle1),
								  curPos.y + dist*Math.sin(angle1)),
				p2 = create_point(curPos.x + dist*Math.cos(angle2),
								  curPos.y + dist*Math.sin(angle2));
				
			return euclidDist(p1, p2);
		},
		
		averageAngle = function (angle1, angle2) {
            var xcomp = (Math.cos(angle1) + Math.cos(angle2))/2,
                ycomp = (Math.sin(angle1) + Math.sin(angle2))/2;
		
            return my_atan(ycomp, xcomp);
		},
        
        createDirGap = function (dir, clearance) {
			return {
                dir: dir,
                clearance: clearance
            };
        },
        
        getViableScanDirectionGaps = function (lidar, curPos) {
            var i, angle, dist, dir,
                startGap = false, 
                endangles = [],
				enddists = [],
                scan = lidar.val,
                scanStartAngle = lidar.start_angle,
                scanAngleInc = lidar.inc,
                scanMaxDist = lidar.MAX_VAL,
                scanDir = lidar.heading,
                directionGaps = [];
                
            endpoints = [];
            
            for (i = 0; i < scan.length; i++) {
                angle = scanStartAngle + scanAngleInc*i + scanDir;
                dist = scan[i];
                
                if (startGap && (Math.abs(dist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD
                                 || scan.length - 1 === i)) {
                    startGap = false;
                    endangles.push(angle);
					enddists.push(dist);
                    endpoints.push(create_point(curPos.x + dist*Math.cos(angle), 
                                                curPos.y + dist*Math.sin(angle)));
                } else if (!startGap && Math.abs(dist - scanMaxDist) < MAX_VAL_NOISE_THREASHOLD
                            && scan.length - 1 !== i) {
                    startGap = true;
                    endangles.push(angle);
					enddists.push(dist);
                    endpoints.push(create_point(curPos.x + dist*Math.cos(angle), 
                                                curPos.y + dist*Math.sin(angle)));
                } 
     		}
			
     		for (i = 0; i < endangles.length; i += 2) {
				dir = averageAngle(endangles[i], endangles[i+1]);
				clearance = calcClearance(curPos, endangles[i], enddists[i], 
												  endangles[i+1], enddists[i+1])
                directionGaps.push(createDirGap(dir, clearance));
            }
            
            var numExtraGaps, delta_dir;
            
            for (i = 0; i < directionGaps.length; i++) {
            	numExtraGaps = Math.floor(directionGaps[i].clearance/MINIMUM_CLEARANCE);
            	
            	if (numExtraGaps > 1) {
            		/*
            		delta_dir = angle_dif(endangles[i*2], endangles[i*2+1]);
            		dir1 = endangles[i*2] + delta_dir/3;
            		dir2 = endangles[i*2] + 2*delta_dir/3;
            		directionGaps.push(createDirGap(dir1, directionGaps[i].clearance*2/3));
            		directionGaps.push(createDirGap(dir2, directionGaps[i].clearance*2/3));
            		*/
            		
            		delta_dir = angle_dif(endangles[i*2], endangles[i*2+1]);
            		
            		for (j = 0; j < numExtraGaps; j++) {
            			dir = endangles[i*2] + (j+1)*delta_dir/(numExtraGaps + 1);
            			directionGaps.push(createDirGap(dir, directionGaps[i].clearance*numExtraGaps/(numExtraGaps+1)));
            		}
            	}
            }
     		
     		return directionGaps;
        },
        
        getGoalGapDirection = function (lidar, goalDir, curPos, distanceToGoal) {
            var i, angle, dist, endangle, endangle1, endangle2, dist1, dist2, 
				goalDist, goalDirIndex, clearance,
                scan = lidar.val,
                scanStartAngle = lidar.start_angle,
                scanAngleInc = lidar.inc,
                scanMaxDist = lidar.MAX_VAL,
                scanDir = lidar.heading,
				scanRange = lidar.end_angle - lidar.start_angle,
                
				theta = (scanDir%(2*Math.PI) + 2*Math.PI)%(2*Math.PI),
				phi = ((goalDir - theta)%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
           
			if (phi > Math.PI) {
                phi -= 2*Math.PI;
            }
			
			goalDirIndex = Math.round((phi + scanRange/2) / scanAngleInc);
            
			// out of lidar range, so just assume a minimum clearance
            if (goalDirIndex < 0 || goalDirIndex >= scan.length) {
				return false;// createDirGap(goalDir, MINIMUM_CLEARANCE);
            }
			
			goalDist = scan[goalDirIndex];
			
			// there is no gap in the direction of the goal
			if (Math.abs(goalDist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD) {
				// and the goal isn't closer than the next obstacle
				if (goalDist > distanceToGoal) {
					return createDirGap(goalDir, MINIMUM_CLEARANCE);
				} else {
					return false;
				}
			}
            
            for (i = goalDirIndex + 1; i < scan.length; i++) {
                dist = scan[i];
				endangle = scanStartAngle + scanAngleInc*i + scanDir;
                
                if (Math.abs(dist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD) {
                    break;
                }
				
                endangle1 = endangle;
				dist1 = dist;
            }
			
            if (i != scan.length
				&& calcClearance(curPos, goalDir, goalDist, endangle1, dist1) < MINIMUM_CLEARANCE/2) {
				return false;
            }
                    
            for (i = goalDirIndex - 1; i >= 0; i--) {
                dist = scan[i];
                endangle = scanStartAngle + scanAngleInc*i + scanDir;
                
                if (Math.abs(dist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD) {
                    break;
                }
				
                endangle2 = endangle;
				dist2 = dist;
            }
			
            if (i != -1 
				&& calcClearance(curPos, goalDir, goalDist, endangle2, dist2) < MINIMUM_CLEARANCE/2) {
				return false;
            }
			
            return createDirGap(goalDir, calcClearance(curPos, endangle1, dist1, endangle2, dist2));
        },
        
        decideBestDirection = function (directionGaps, curDir, goalDir, curPos, lidar) {
            var dirgap, clearance, heading_alignment, goal_alignment, score, 
                bestScore = -1, // maximize this
                bestDir = null;
            
            dirLines = [];

            for (i = 0; i < directionGaps.length; i++) {
                dirgap = directionGaps[i];
            
                clearance = dirgap.clearance/(2*LINE_LENGTH);
                heading_alignment = (2*Math.PI - angle_dif(curDir, dirgap.dir))/(2*Math.PI);
                goal_alignment = (2*Math.PI - angle_dif(goalDir, dirgap.dir))/(2*Math.PI);
                
                score = clearance * WEIGHTS.CLEARANCE
                      + heading_alignment * WEIGHTS.HEADING_ALIGNMENT
                      + goal_alignment * WEIGHTS.GOAL_ALIGNMENT;
				
				if (clearance >= MINIMUM_CLEARANCE/(2*LINE_LENGTH)) {
                    dirLines.push(create_line_from_vector(curPos, dirgap.dir, LINE_LENGTH));
                
                    if (score > bestScore) {
                        bestScore = score;
                        bestDir = dirgap.dir;
                    }
                } 
            }
            
            return bestDir;
        },
		
		navigateNormally = function () {
			var i, curPos, scan, directionGaps, goalDir, goalGapDir, bestDir, distanceToGoal;

			curPos = lidar.pos;
			curDir = robot.heading;

			// return if the current position is close enough to the goal
			if (euclidDist(goalPos, curPos) < GOAL_THREASHOLD) {
				lineFollower.follow(null);
				lineFollower.takeAction();
				return;
			}

			// find viable (direction, gap) pairs from lidar + current heading
			directionGaps = getViableScanDirectionGaps(lidar, curPos);

			// calculate goal direction and distance
			goalDir = create_line(curPos, goalPos).theta;
			distanceToGoal = euclidDist(curPos, goalPos);
			
			// add in (direction, gap) to goal if viable based on scan
			goalGapDir = getGoalGapDirection(lidar, goalDir, curPos, distanceToGoal);
			
			if (goalGapDir) {
				directionGaps.push(goalGapDir);
			}
			
			// choose best (direction, gap) based on...
			//      clearance, closeness to goal direction, closeness to current position
			bestDir = decideBestDirection(directionGaps, curDir, goalDir, curPos, lidar);
			
			// create line from direction
			if (null !== bestDir) {
				lineResult = create_line_from_vector(curPos, bestDir, LINE_LENGTH);
			} else {
				lineResult = null;
			}
			
			// send line to lineFollower
			lineFollower.follow(lineResult);
			lineFollower.takeAction();
		},
		
		turnTowardsGoal = function () {
			var curDir, curPos, goalDir;

			curPos = lidar.pos;
			curDir = robot.heading;
			goalDir = create_line(curPos, goalPos).theta;

			// return if we're facing the goal
			console.log(angle_dif(curDir, goalDir));
			
			if (angle_dif(curDir, goalDir) < GOAL_DIR_THREASHOLD) {
				turningTowardsGoal = false;
				return;
			}
			
			robot.set_wheel_velocities(-MAX_V/2, MAX_V/2);
		};
    
    that.getGoal = function () {
        return goalPos;
    };
    
    that.setGoal = function (newGoal) {
        goalPos = create_point(newGoal.x, newGoal.y);
        dirLines = [];
		endpoints = [];
		lineResult = null;
		turningTowardsGoal = true;
    };
    
    that.makeDecision = function () {
        var i, curPos, scan, directionGaps, goalDir, goalGapDir, bestDir, distanceToGoal;

        if (!goalPos) {
            return;
        }
		
		navigateNormally();
		
		/*
		if (turningTowardsGoal) {
			turnTowardsGoal();
		//} else if (turningOutOfDeadEnd) {
		//	navigateOutOfDeadEnd();
		} else {
			navigateNormally();
		}
		*/
    };
    
    that.draw = function () {
        var i;
        
        if (!goalPos) {
            return;
        }
        
        context.save();
        
        if (endpoints) {
            context.lineWidth = 1;
            for (i = 0; i < endpoints.length; i++) {
                context.fillStyle = (i%2 == 0) ? "blue" : "green";
                context.beginPath();
                context.arc(endpoints[i].x, endpoints[i].y, 5, 0, Math.PI*2, false);
                context.fill();
            }
        }
        
        if (dirLines) {
	        context.lineWidth = 2;
	        context.strokeStyle = "gray";
            for (i = 0; i < dirLines.length; i++) {
                context.beginPath();
	            context.moveTo(dirLines[i].p1.x, dirLines[i].p1.y);
	            context.lineTo(dirLines[i].p2.x, dirLines[i].p2.y);
	            context.stroke();
            }
        }
        
        if (lineResult) {
	        context.lineWidth = .5;
	        context.strokeStyle = "red";
            context.beginPath();
            context.moveTo(lineResult.p1.x, lineResult.p1.y);
            context.lineTo(lineResult.p2.x, lineResult.p2.y);
            context.stroke();
        }
        
        context.restore();
    };
    
    return that;
};
