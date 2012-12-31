function Sensor(robot) {
    var true_value = null,
        returned_value = null;
        
    this.update = function() {
    
    };
        
    this.read = function() {
        return returned_value;
    };
}

function GPS(robot) {
    var true_value = {x:null, y:null},
        returned_value = {x:null, y:null};
        
    this.update = function() {
        true_value.x = robot.x;
        true_value.y = robot.y;
        returned_value.x = true_value.x + Math.random()*2 - 1;
        returned_value.y = true_value.y + Math.random()*2 - 1;
    };
        
    this.read = function() {
        return returned_value;
    };
}

function Compass(robot) {
    return {
        val: null,
        
        update: function(robot) {
            val = robot.heading;
        },
        
        read: function() {
            return val;
        }
    }
}

function encoders(robot) {
    return {
        vals: [0, 0],    
  
        update: function(robot, delta_time) {
            vals[0] += robot.wheel1_velocity*delta_time;
            vals[1] += robot.wheel2_velocity*delta_time;
        },
        
        read: function() {
            return this.vals;
        }
    }
}

function line_strip(points) {
    var lines = new Array(points.length-1);
    
    for (var i = 0; i < points.length-1; i++) {
        lines[i] = create_line(points[i], points[i+1]);
    }
    
    return {
        points: points,
        lines: lines
    };
}

function line_sensor(linestrip, robot, offset_angle, offset_dist, len, num_sensors) {
    return {
        SENSOR_RADIUS: 3,
        
        linestrip: linestrip,
        x: robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
        y: robot.y + offset_dist*Math.sin(offset_angle + robot.heading),
        offset_dist: offset_dist,
        offset_angle: offset_angle,
        len: len,
        num_sensors: num_sensors,
        vals: new Array(num_sensors),
        
        update: function(robot, delta_time) {
            this.x = robot.x + this.offset_dist*Math.cos(this.offset_angle + robot.heading);
            this.y = robot.y + this.offset_dist*Math.sin(this.offset_angle + robot.heading);
            this.setVals(this.x, this.y, this.linestrip.lines);
        },
        
        read: function() {
            return this.vals;
        },

        setVals: function(x, y, lines) {
            for (var i = 0; i < this.num_sensors; i++) {
                var d = i*(this.len/(this.num_sensors-1)) - this.len/2;
                var cur_x = x + d*Math.cos(this.offset_angle+PI/2 + robot.heading),
                    cur_y = y + d*Math.sin(this.offset_angle+PI/2 + robot.heading);
            
                var circle = create_circle({x:cur_x,y:cur_y}, this.SENSOR_RADIUS);
                this.vals[i] = false;
                for (var j = 0; j < lines.length; j++) {
                    if (dirLineSegCircleIntersection(lines[j], circle)) {
                        this.vals[i] = true;
                    }
                }
            }
        },

        draw: function(context, verbose) {
            for (var i = 0; i < this.vals.length; i++) {
                var d = i*(this.len/(this.num_sensors-1)) - this.len/2;
                var cur_x = this.x + d*Math.cos(this.offset_angle+PI/2 + robot.heading),
                    cur_y = this.y + d*Math.sin(this.offset_angle+PI/2 + robot.heading);
                    
                if (this.vals[i]) {
                    context.fillStyle = "tan";
                    context.beginPath();
                    context.arc(cur_x, cur_y, this.SENSOR_RADIUS, 0, 2*PI, true);
                    context.fill();
                } else {
                    context.strokeStyle = "green";
                    context.beginPath();
                    context.arc(cur_x, cur_y, this.SENSOR_RADIUS, 0, 2*PI, true);
                    context.stroke();
                }
            }
        }
    }
}

function obstacle(polygon) {
    return {
        polygon: polygon,
        
        draw: function(context) {
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

function lidar_sensor(raytracer, robot, offset_angle, offset_dist, offset_heading, MAX_VAL, rotvel, start_angle, end_angle, num_angles) {
    return {
        raytracer: raytracer,
        pos: {
			x: robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
			y: robot.y + offset_dist*Math.sin(offset_angle + robot.heading)
        },
		heading: robot.heading + offset_heading,
        offset_angle: offset_angle,
        offset_dist: offset_dist,
        offset_heading: offset_heading,
        MAX_VAL: MAX_VAL,
        rotvel: rotvel,
        start_angle: start_angle, 
        end_angle: end_angle, 
        num_angles: num_angles,
        val: new Array(num_angles),
        inc: (end_angle-start_angle)/(num_angles),

        update : function(robot, delta_time) {
            this.pos.x = robot.x + this.offset_dist*Math.cos(this.offset_angle + robot.heading);
            this.pos.y = robot.y + this.offset_dist*Math.sin(this.offset_angle + robot.heading);
            this.offset_heading = (this.offset_heading + this.rotvel*delta_time)%(2*PI);
            this.heading = robot.heading + this.offset_heading; 
            this.setVals(this.pos, this.heading, this.MAX_VAL); 
        },
        
        set_offset_angle: function(angle) {
            this.offset_heading = angle%(2*PI);
        },
        
        read: function() {
            return {
                distance: this.val,
                offset_angle: this.offset_heading
            };
        },
        
        setVals: function(point, dir, max_val) {
            for (var i = 0; i < this.num_angles; i++) {
				var angle = dir + this.start_angle + this.inc*i;
                this.val[i] = this.getVal(point, angle, max_val);
            }
        },

        getVal: function(point, dir, max_val) {
            var res = this.raytracer.trace(point, dir, max_val);
            return euclidDist(point, res);
        },

        draw: function(context, verbose) {
            context.strokeStyle = "rgba(100, 100, 100, 0.2)";
            for (var i = 0; i < this.num_angles; i++) {
              var angle = this.start_angle+this.inc*i;
              var dist = this.val[i];
              context.beginPath();
              context.moveTo(this.pos.x, this.pos.y);
              context.lineTo(this.pos.x + dist*Math.cos(this.heading+angle), 
                             this.pos.y + dist*Math.sin(this.heading+angle));
              context.stroke();   
            }
        }
    }
} 

function distance_sensor(raytracer, robot, offset_angle, offset_dist, offset_heading, MAX_VAL, rotvel) {
    return {
        raytracer: raytracer,
        x: robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
        y: robot.y + offset_dist*Math.sin(offset_angle + robot.heading),
        heading: robot.heading + offset_heading,
        offset_angle: offset_angle,
        offset_dist: offset_dist,
        offset_heading: offset_heading,
        MAX_VAL: MAX_VAL,
        rotvel: rotvel,
        val: null,

        update: function(robot, delta_time) {
            this.x = robot.x + this.offset_dist*Math.cos(this.offset_angle + robot.heading);
            this.y = robot.y + this.offset_dist*Math.sin(this.offset_angle + robot.heading);
            this.offset_heading = (this.offset_heading + this.rotvel*delta_time)%(2*PI);
            this.heading = robot.heading + this.offset_heading; 
            this.val = this.getVal(this.x, this.y, this.heading, this.MAX_VAL); 
        },
        
        set_offset_angle: function(angle) {
            this.offset_heading = angle%(2*PI);
        },
        
        read: function() {
            return {
                distance: this.val,
                offset_angle: this.offset_heading
            };
        },

        getVal: function(x, y, dir) {
            var point = create_point(x, y);
            var res = this.raytracer.trace(point, dir, this.MAX_VAL);
            return euclidDist(point, res);
        },

        draw: function(context, verbose) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.val*Math.cos(this.heading), 
                           this.y + this.val*Math.sin(this.heading));
            context.stroke();   
            
            if (verbose) {
                var dispval = Math.round(this.val*1000)/1000;
                context.fillText(dispval, this.x, this.y);
            }
        }
    }
} 

function OldDistanceSensor(obstacles, robot, offset_angle, offset_dist, offset_heading, MAX_VAL, rotvel) {
    return {
        x : robot.x + offset_dist*Math.cos(offset_angle + robot.heading),
        y : robot.y + offset_dist*Math.sin(offset_angle + robot.heading),
        heading : robot.heading + offset_heading,
        offset_heading : offset_heading,
        offset_dist : offset_dist,
        offset_angle : offset_angle,
        val: null,
        obstacles : obstacles,
        MAX_VAL : MAX_VAL,
        rotvel: rotvel,

        update : function(robot, delta_time) {
            this.x = robot.x + this.offset_dist*Math.cos(this.offset_angle + robot.heading);
            this.y = robot.y + this.offset_dist*Math.sin(this.offset_angle + robot.heading);
            this.offset_heading = (this.offset_heading + this.rotvel*delta_time)%(2*PI);
            this.heading = robot.heading + this.offset_heading; 
            this.val = this.getVal(this.x, this.y, this.heading, this.obstacles, this.MAX_VAL); 
        },
        
        set_offset_angle: function(angle) {
            this.offset_heading = angle%(2*PI);
        },
        
        read : function() {
            return {
                distance: this.val,
                offset_angle: this.offset_heading
            };
        },

        getVal : function(x, y, dir, obstacles, max_dist) {
            var laser = create_line_from_vector(
                            create_point(x, y), 
                            dir, 
                            CANVAS_WIDTH*2
                        );
                        
            var mindist = max_dist;
            
            for (var i = 0; i < obstacles.length; i++) {
                var polylines = obstacles[i].polygon.lines;
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

        draw : function(context, verbose) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.val*Math.cos(this.heading), 
                           this.y + this.val*Math.sin(this.heading));
            context.stroke();   
            
            if (verbose) {
                var dispval = Math.round(this.val*1000)/1000;
                context.fillText(dispval, this.x, this.y);
            }
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
