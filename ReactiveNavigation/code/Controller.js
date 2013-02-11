function create_controller(robot, lidar, lineFollower) {
    var that = {},
        endpoints, dirLines, lineResult,
        goalPos = null,
        
        GOAL_THREASHOLD = 10,
        MAX_VAL_NOISE_THREASHOLD = 1e-7,
        MINIMUM_CLEARANCE = Math.PI/5,
        WEIGHTS = {
            CLEARANCE: 0,
            HEADING_ALIGNMENT: 0,
            GOAL_ALIGNMENT: 1
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
        
        createDirGap = function (curPos, angle1, dist1, angle2, dist2) {
			var p1 = create_point(curPos.x + dist1*Math.cos(angle1),
								  curPos.y + dist1*Math.sin(angle1)),
				p2 = create_point(curPos.x + dist2*Math.cos(angle2),
								  curPos.y + dist2*Math.sin(angle2)),
				clearance = euclidDist(p1, p2),
				
                xcomp = (Math.cos(angle1) + Math.cos(angle2))/2,
                ycomp = (Math.sin(angle1) + Math.sin(angle2))/2,
                dir = my_atan(ycomp, xcomp);
		
            return {
                clearance: clearance,
                dir: dir
            };
        },
        
        getViableScanDirectionGaps = function (lidar, curPos) {
            var i, angle, dist, xcomp, ycomp, dir,
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
                directionGaps.push(createDirGap(curPos, endangles[i], enddists[i], endangles[i+1], enddists[i+1]));
            }
     		
     		return directionGaps;
        },
        
        getGoalGapDirection = function (lidar, goalDir, curPos) {
            goalDir = (goalDir%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
            if (goalDir > Math.PI) {
                goalDir -= 2*Math.PI;
            }
        
            var i, angle, dist, endangle1, endangle2, dist1, dist2,
                scan = lidar.val,
                
                scanStartAngle = lidar.start_angle,
                scanAngleInc = lidar.inc,
                scanMaxDist = lidar.MAX_VAL,
                scanDir = lidar.heading,
                
                goalDirIndex = Math.round((goalDir - scanStartAngle - scanDir) / scanAngleInc),
                numIndexes = Math.round(MINIMUM_CLEARANCE/2/lidar.inc);
                
            if (goalDirIndex < 0 || goalDirIndex >= scan.length) {
                return createDirGap(goalDir-MINIMUM_CLEARANCE, goalDir+MINIMUM_CLEARANCE, goalDir);
            }
            
            for (i = goalDirIndex; i < scan.length; i++) {
                dist = scan[i];
                
                if (Math.abs(dist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD) {
                    if (i <= goalDirIndex + numIndexes) {
                        return false;
                    }
                    
                    break;
                }
				
                endangle1 = scanStartAngle + scanAngleInc*i + scanDir;
				dist1 = dist;
            }
            
            for (i = goalDirIndex; i >= 0; i--) {
                dist = scan[i];
                
                if (Math.abs(dist - scanMaxDist) > MAX_VAL_NOISE_THREASHOLD) {
                    if (i >= goalDirIndex - numIndexes) {
                        return false;
                    }
                    
                    break;
                }
				
                endangle2 = scanStartAngle + scanAngleInc*i + scanDir;
				dist2 = dist;
            }
            
            return createDirGap(curPos, endangle1, dist1, endangle2, dist2);
        },
        
        decideBestDirection = function (directionGaps, curDir, goalDir, curPos, lidar) {
            var dirgap, clearance, heading_alignment, goal_alignment, score, 
                bestScore = -1, // maximize this
                bestDir = null;
            
            dirLines = [];

            for (i = 0; i < directionGaps.length; i++) {
                dirgap = directionGaps[i];
            
                clearance = dirgap.clearance;
                heading_alignment = (2*Math.PI - angle_dif(curDir, dirgap.dir))/(2*Math.PI);
                goal_alignment = (2*Math.PI - angle_dif(goalDir, dirgap.dir))/(2*Math.PI);
                
                score = clearance * WEIGHTS.CLEARANCE
                      + heading_alignment * WEIGHTS.HEADING_ALIGNMENT
                      + goal_alignment * WEIGHTS.GOAL_ALIGNMENT;
                
                if (clearance*Math.PI*2 > MINIMUM_CLEARANCE) {
                    dirLines.push(create_line_from_vector(curPos, dirgap.dir, lidar.MAX_VAL + 30));
                
                    if (score > bestScore) {
                        bestScore = score;
                        bestDir = dirgap.dir;
                    }
                } 
            }
            
            return bestDir;
        };
    
    that.getGoal = function () {
        return goalPos;
    };
    
    that.setGoal = function (newGoal) {
        goalPos = create_point(newGoal.x, newGoal.y);
    };
    
    that.makeDecision = function () {
        var i, curPos, scan, directionGaps, goalDir, goalGapDir, bestDir;
    
        if (!goalPos) {
            return;
        }
        
        curDir = robot.heading;
        curPos = robot.get_centerpoint();
        
        // return if the current position is close enough to the goal
        if (euclidDist(goalPos, curPos) < GOAL_THREASHOLD) {
            lineFollower.follow(null);
            return;
        }
    
        // find viable (direction, gap) pairs from lidar + current heading
        directionGaps = getViableScanDirectionGaps(lidar, curPos);
        
        // calculate goal direction
        goalDir = create_line(curPos, goalPos).theta;
        
        // add in (direction, gap) to goal if viable based on scan
        goalGapDir = getGoalGapDirection(lidar, goalDir, curPos);
        
        if (goalGapDir) {
            directionGaps.push(goalGapDir);
        }
        
        // choose best (direction, gap) based on...
        //      clearance, closeness to goal direction, closeness to current position
        bestDir = decideBestDirection(directionGaps, curDir, goalDir, curPos, lidar);
        
        // create line from direction
        if (null !== bestDir) {
            lineResult = create_line_from_vector(curPos, bestDir, lidar.MAX_VAL + 30);
        } else {
            lineResult = null;
        }
        
        // send line to lineFollower
        lineFollower.follow(lineResult);
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
