function obstacle(polygon) {
    return {
        polygon : polygon,
        
        draw : function(context) {
	          var points = this.polygon.points;
	          
	          context.beginPath();
	          context.moveTo(points[0].x, points[0].y);
	          for (i = 1; i < points.length; i++) {
		          context.lineTo(points[i].x, points[i].y);
	          }
	          context.closePath();
	          
	          context.stroke();
        }
    }
}

function dist_sensor(obstacles, robot, offset_angle, offset_dist, offset_heading, MAX_VAL) {
    return {
        x : robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
        y : robot.y + offset_dist*Math.sin(offset_angle + robot.heading),
        heading : robot.heading + offset_heading,
        oh : offset_heading,
        od : offset_dist,
        oa : offset_angle,
        val: null,
        obstacles : obstacles,
        MAX_VAL : MAX_VAL,

        update : function(robot) {
            this.x = robot.x + this.od*Math.cos(this.oa + robot.heading);
            this.y = robot.y + this.od*Math.sin(this.oa + robot.heading);
            this.heading = robot.heading + this.oh;
            this.val = this.getVal(); 
        },

        getVal : function() {
            var laser = create_line_from_vector(
                create_point(this.x, this.y), 
                this.heading, 
                CANVAS_WIDTH*2);
            var mindist = this.MAX_VAL;
            for (var i = 0; i < this.obstacles.length; i++) {
                var polylines = this.obstacles[i].polygon.lines;
                for (var j = 0; j < polylines.length; j++) {
                    var intersection = lineSegmentIntersection(laser, polylines[j]);
                    if (intersection) {
                        var dist = euclidDist(laser.p1, intersection);
                        if (dist < mindist) {
                            mindist = dist;
                        }
                    }
                }
            }
            return mindist;
        },

        draw : function(context) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.val*Math.cos(this.heading), 
                           this.y + this.val*Math.sin(this.heading));
            context.stroke();   
            
            var dispval = Math.round(this.val*1000)/1000;
            context.fillText(dispval, this.x, this.y);
        }
    }
} 

function light_source(x, y, variance) {
    return {
        variance: variance,
        x: x,
        y: y,

        getValue : function(x, y) {
            var dx = this.x - x,
                dy = this.y - y;
            var dist = Math.sqrt(dx*dx + dy*dy),
                v = this.variance,
                norm = 1.0/(Math.sqrt(2*Math.PI)*v);
            
            return Math.exp(-(dist*dist)/(2*v*v))/(Math.sqrt(2*Math.PI)*v)/norm;
        },       
 
        draw : function(context) {
            context.beginPath();
            context.arc(this.x, this.y, this.variance/2, 0, PI*2, false); 
            context.fill();
        }
    }
}

function light_sensor(sources, robot, offset_angle, offset_dist) {
    return {
        x : robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
        y : robot.y + offset_dist*Math.sin(offset_angle + robot.heading),
        od : offset_dist,
        oa : offset_angle,
        val: null,
        sources: sources,

        update : function(robot) {
            this.x = robot.x + this.od*Math.cos(this.oa + robot.heading);
            this.y = robot.y + this.od*Math.sin(this.oa + robot.heading);
            this.val = 0;
            
            for (var i = 0; i < sources.length; i++) {
                this.val += this.sources[i].getValue(this.x, this.y);
            }
            
            this.val /= .9;  
        },

        getVal : function() {
            return val;
        },

        draw : function(context) {
            var dispval = Math.round(this.val*1000)/1000;
            context.fillText(dispval, this.x, this.y);
        }
    }
}
