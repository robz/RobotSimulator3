var ACKERMAN = 0, TANK = 1, CRAB = 2;
var MAX_ALPHA_ACKERMAN = PI/3, MAX_ALPHA_CRAB = 3*PI/4, MAX_V = .1,
    SCALE = 1, WHEEL_WIDTH = 4*SCALE, WHEEL_LENGTH = 15*SCALE;

// wheels and corners are created here to avoid allocating memory dynamically
//  (these are used is for drawing a robot)
var wheels = [[{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}],
              [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}],
              [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}],
              [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}],
              [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}],
              [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}]],
    corners = [{x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0,y:0}, {x:0, y:0}, {x:0, y:0}];
    
var cos = Math.cos, sin = Math.sin, abs = Math.abs;

function crab_robot(x, y, heading, steering_angle, velocity, length, width,
            last_time_updated, time_keeper) 
{
    return {
        type : CRAB,
        x : x,
        y : y,
        heading : heading,
        steering_angle : steering_angle,
        velocity : velocity,
        length : length,
        width : width,
        last_time_updated: last_time_updated,
        getTime: time_keeper.getTime,
        
        set : function (x, y, heading, steering_angle, velocity, length, width,
                last_time_updated) 
        {
            this.x = x;
            this.y = y;
            this.heading = heading;
            this.steering_angle = steering_angle;
            this.velocity = velocity;
            this.length = length;
            this.width = width;
            this.last_time_updated = last_time_updated;
        },
        
        update : function() {
            var cur_time = this.getTime(),
                delta_time = cur_time - this.last_time_updated,
                delta_distance = this.velocity*delta_time;  
            if (!this.last_time_updated) {
                delta_distance = 0;
            }
            this.last_time_updated = cur_time;
        
            var theta = this.heading + this.steering_angle;
            
            var new_x = this.x + delta_distance*cos(theta),
                new_y = this.y + delta_distance*sin(theta),
                new_heading = this.heading;
            
            this.set(new_x, new_y, new_heading, this.steering_angle, this.velocity, 
                    this.length, this.width, this.last_time_updated);
        },
        
        steer : function(delta_steering_angle) {
            var new_steering_angle = this.steering_angle + delta_steering_angle;
            
            if (new_steering_angle > MAX_ALPHA_CRAB) {
                new_steering_angle = MAX_ALPHA_CRAB;
            } else if (new_steering_angle < -MAX_ALPHA_CRAB) {
                new_steering_angle = -MAX_ALPHA_CRAB;
            }
            
            this.set(this.x, this.y, this.heading, new_steering_angle, this.velocity, 
                    this.length, this.width, this.last_time_updated);
        },
        
        accelerate : function(delta_velocity) {
            var new_velocity = this.velocity + delta_velocity;
            
            if (new_velocity > MAX_V) {
                new_velocity = MAX_V;
            } else if (new_velocity < -MAX_V) {
                new_velocity = -MAX_V;
            }
            
            this.set(this.x, this.y, this.heading, this.steering_angle, new_velocity, 
                    this.length, this.width, this.last_time_updated);
        },
        
        // returns [{x:x1,y:y1},...,{x:x4,y:y4}]
        get_corners : function() {
            var theta = this.heading,
                W = this.width,
                L = this.length,
                x = this.x,
                y = this.y;
                
            corners[0].x = x + (W/2)*cos(theta + PI/2);     
            corners[0].y = y + (W/2)*sin(theta + PI/2);
            corners[3].x = x + (W/2)*cos(theta + 3*PI/2); 
            corners[3].y = y + (W/2)*sin(theta + 3*PI/2);
            corners[1].x = corners[0].x + L*cos(theta); 
            corners[1].y = corners[0].y + L*sin(theta);
            corners[2].x = corners[3].x + L*cos(theta); 
            corners[2].y = corners[3].y + L*sin(theta);
            
            return corners;
        },
        
        // returns [[{x:x11,y:y11},...,{x:x14,y:y14}],...,[{x:x41,y:y41},...]]
        get_wheels : function(corners) {
            var W = WHEEL_WIDTH,
                L = WHEEL_LENGTH,
                x = this.x,
                y = this.y,
                theta = this.heading + this.steering_angle;
            
            for (var i = 0; i < 4; i++) {
                var c = corners[i];
                    
                var t1x = c.x + W*cos(theta + PI/2),    
                    t1y = c.y + W*sin(theta + PI/2),
                    t2x = c.x + W*cos(theta + 3*PI/2),  
                    t2y = c.y + W*sin(theta + 3*PI/2);
                    
                wheels[i][0].x = t1x + (L/2)*cos(theta + PI); 
                wheels[i][0].y = t1y + (L/2)*sin(theta + PI);
                wheels[i][1].x = t1x + (L/2)*cos(theta);    
                wheels[i][1].y = t1y + (L/2)*sin(theta);
                wheels[i][3].x = t2x + (L/2)*cos(theta + PI); 
                wheels[i][3].y = t2y + (L/2)*sin(theta + PI);
                wheels[i][2].x = t2x + (L/2)*cos(theta);    
                wheels[i][2].y = t2y + (L/2)*sin(theta);
            }
            
            return wheels;
        },
        
        draw : function(context) {
            this.get_corners();
            this.get_wheels(corners);

            context.lineWidth = 3;
            context.strokeStyle = "orange";
            context.beginPath();
            context.moveTo(corners[0].x, corners[0].y);
            for(i = 1; i < 4; i++) {
                context.lineTo(corners[i].x, corners[i].y);
            }
            context.closePath();
            context.stroke();
            
            context.lineWidth = 1;
            context.strokeStyle = "black";
            for (j = 0; j < 4; j++) {
                var wheel = wheels[j];
                context.beginPath();
                context.moveTo(wheel[0].x, wheel[0].y);
                for(i = 1; i < 4; i++) {
                    context.lineTo(wheel[i].x, wheel[i].y);
                }
                context.closePath();
                context.stroke();
            }
        },
    };
}

function tank_robot(x, y, heading, wheel1_velocity, wheel2_velocity, length, width, 
            last_time_updated, time_keeper) 
{
    return {
        type : TANK,
        x : x,
        y : y,
        heading : heading,
        wheel1_velocity : wheel1_velocity,
        wheel2_velocity : wheel2_velocity,
        length : length,
        width : width,
        last_time_updated: last_time_updated,
        getTime: time_keeper.getTime,
        sensors: [],
        
        set : function (x, y, heading, wheel1_velocity, wheel2_velocity, length, width,
                last_time_updated) 
        {
            this.x = x;
            this.y = y;
            this.heading = heading;
            this.wheel1_velocity = wheel1_velocity;
            this.wheel2_velocity = wheel2_velocity;
            this.width = width;
            this.last_time_updated = last_time_updated;
        },
        
        update: function() {
            var cur_time = this.getTime(),
                dt = cur_time - this.last_time_updated;
            this.last_time_updated = cur_time;
            
            var x = this.x, y = this.y, theta = this.heading, L = this.width, 
                Vl = this.wheel1_velocity, Vr = this.wheel2_velocity;
            
            var new_x, new_y, new_heading;
            
            if (abs(Vl - Vr) < .00001) {
                new_x = x + Vl*dt*cos(theta);
                new_y = y + Vl*dt*sin(theta);
                new_heading = theta;
            } else {
                // Credit: Dudek and Jenkin, Computational Principles of Mobile Robotics
                var R = L*(Vl + Vr)/(2*(Vr - Vl)),
                    wd = dt*(Vr - Vl)/L;
                new_x = x + R*cos(wd)*sin(theta) + R*sin(wd)*cos(theta) - R*sin(theta);
                new_y = y + R*sin(wd)*sin(theta) - R*cos(wd)*cos(theta) + R*cos(theta);
                new_heading = theta + wd;
            }
            
            new_heading = new_heading%(2*PI);
            
            this.set(new_x, new_y, new_heading, this.wheel1_velocity, 
                this.wheel2_velocity, this.length, this.width, this.last_time_updated);
            
            for (var i = 0; i < this.sensors.length; i++) {
                this.sensors[i].update(this);
            }
        },
        
        accelerate_wheels : function(delta_wheel1_velocity, delta_wheel2_velocity) {
            var new_wheel1_velocity = this.wheel1_velocity + delta_wheel1_velocity,
                new_wheel2_velocity = this.wheel2_velocity + delta_wheel2_velocity;
            
            if (new_wheel1_velocity > MAX_V) {
                new_wheel1_velocity = MAX_V;
            } else if (new_wheel1_velocity < -MAX_V) {
                new_wheel1_velocity = -MAX_V;
            }
            
            if (new_wheel2_velocity > MAX_V) {
                new_wheel2_velocity = MAX_V;
            } else if (new_wheel2_velocity < -MAX_V) {
                new_wheel2_velocity = -MAX_V;
            }
            
            this.set(this.x, this.y, this.heading, new_wheel1_velocity, 
                new_wheel2_velocity, this.length, this.width, this.last_time_updated);
        },
       
        get_centerpoint : function () {
            return {
                x : this.x + this.length/2 * Math.cos(this.heading),
                y : this.y + this.length/2 * Math.sin(this.heading)
            };
        }, 
 
        get_corners : function() {
            var theta = this.heading,
                W = this.width,
                L = this.length,
                x = this.x,
                y = this.y;
                
            corners[0].x = x + (W/2)*cos(theta + PI/2);     
            corners[0].y = y + (W/2)*sin(theta + PI/2);
            corners[3].x = x + (W/2)*cos(theta + 3*PI/2); 
            corners[3].y = y + (W/2)*sin(theta + 3*PI/2);
            corners[1].x = corners[0].x + L*cos(theta); 
            corners[1].y = corners[0].y + L*sin(theta);
            corners[2].x = corners[3].x + L*cos(theta); 
            corners[2].y = corners[3].y + L*sin(theta);
            
            return corners;
        },
        
        // returns [[{x:x11,y:y11},...,{x:x14,y:y14}],[{x:x21,y:y21},...]]
        get_wheels : function(corners) {
            var W = WHEEL_WIDTH,
                L = WHEEL_LENGTH,
                x = this.x,
                y = this.y;
            
            for (var i = 0; i < 2; i++) {
                var theta = this.heading,
                    c = corners[i*3];
                    
                var t1x = c.x + W*cos(theta + PI/2),    
                    t1y = c.y + W*sin(theta + PI/2),
                    t2x = c.x + W*cos(theta + 3*PI/2),  
                    t2y = c.y + W*sin(theta + 3*PI/2);
                    
                wheels[i][0].x = t1x + (L/2)*cos(theta + PI); 
                wheels[i][0].y = t1y + (L/2)*sin(theta + PI);
                wheels[i][1].x = t1x + (L/2)*cos(theta);    
                wheels[i][1].y = t1y + (L/2)*sin(theta);
                wheels[i][3].x = t2x + (L/2)*cos(theta + PI); 
                wheels[i][3].y = t2y + (L/2)*sin(theta + PI);
                wheels[i][2].x = t2x + (L/2)*cos(theta);    
                wheels[i][2].y = t2y + (L/2)*sin(theta);
            }
            
            return wheels;
        },
        
        get_caster : function(corners) {
            var c = corners[1];
            return {x: c.x + (this.width/2)*cos(this.heading - PI/2), 
                    y: c.y + (this.width/2)*sin(this.heading - PI/2)};
        },
        
        draw : function(context) {
            this.get_corners();
            this.get_wheels(corners);
            var caster = this.get_caster(corners);
            
            context.lineWidth = 3;
            context.strokeStyle = "green";
            context.beginPath();
            context.moveTo(corners[0].x, corners[0].y);
            for(i = 1; i < 4; i++) {
                context.lineTo(corners[i].x, corners[i].y);
            }
            context.closePath();
            context.stroke();
            
            context.lineWidth = 1;
            context.strokeStyle = "black";
            for (j = 0; j < 2; j++) {
                var wheel = wheels[j];
                context.beginPath();
                context.moveTo(wheel[0].x, wheel[0].y);
                for(i = 1; i < 4; i++) {
                    context.lineTo(wheel[i].x, wheel[i].y);
                }
                context.closePath();
                context.stroke();
            }
            
            context.beginPath();
            context.arc(caster.x, caster.y, WHEEL_WIDTH, 0, 2*PI, false);
            context.stroke();
        }
    };
}
    
function ackerman_robot(x, y, heading, steering_angle, velocity, length, width,
            last_time_updated, time_keeper) 
{
    return {
        type : ACKERMAN,
        x : x,
        y : y,
        heading : heading,
        steering_angle : steering_angle,
        velocity : velocity,
        length : length,
        width : width,
        last_time_updated: last_time_updated,
        getTime: time_keeper.getTime,
        
        set : function (x, y, heading, steering_angle, velocity, length, width,
                last_time_updated) 
        {
            this.x = x;
            this.y = y;
            this.heading = heading;
            this.steering_angle = steering_angle;
            this.velocity = velocity;
            this.length = length;
            this.width = width;
            this.last_time_updated = last_time_updated;
        },
        
        update : function() {
            var cur_time = this.getTime(),
                delta_time = cur_time - this.last_time_updated,
                delta_distance = this.velocity*delta_time;  
            if (!this.last_time_updated) {
                delta_distance = 0;
            }
            this.last_time_updated = cur_time;
        
            var theta = this.heading,
                d = delta_distance;
            
            var new_x, new_y, new_heading;
            
            if (0 == delta_distance) {
                new_x = this.x;
                new_y = this.y;
                new_heading = theta;
            } else if (0 == this.steering_angle) {
                new_x = this.x + d*cos(theta);
                new_y = this.y + d*sin(theta);
                new_heading = theta;
            } else {
                var beta = (d/this.length)*Math.tan(this.steering_angle);
                var R = d/beta;
                new_heading = (theta + beta)%(2*PI);
                new_x = this.x - R*sin(theta) + R*sin(new_heading);
                new_y = this.y + R*cos(theta) - R*cos(new_heading);
            }
            
            this.set(new_x, new_y, new_heading, this.steering_angle, this.velocity, 
                    this.length, this.width, this.last_time_updated);
        },
        
        steer : function(delta_steering_angle) {
            var new_steering_angle = this.steering_angle + delta_steering_angle;
            
            if (new_steering_angle > MAX_ALPHA_ACKERMAN) {
                new_steering_angle = MAX_ALPHA_ACKERMAN;
            } else if (new_steering_angle < -MAX_ALPHA_ACKERMAN) {
                new_steering_angle = -MAX_ALPHA_ACKERMAN;
            }
            
            this.set(this.x, this.y, this.heading, new_steering_angle, this.velocity, 
                this.length, this.width, this.last_time_updated);
        },
        
        accelerate : function(delta_velocity) {
            var new_velocity = this.velocity + delta_velocity;
            
            if (new_velocity > MAX_V) {
                new_velocity = MAX_V;
            } else if (new_velocity < -MAX_V) {
                new_velocity = -MAX_V;
            }
            
            this.set(this.x, this.y, this.heading, this.steering_angle, new_velocity, 
                this.length, this.width, this.last_time_updated);
        },
        
        // returns [{x:x1,y:y1},...,{x:x4,y:y4}]
        get_corners : function() {
            var theta = this.heading,
                W = this.width,
                L = this.length,
                x = this.x,
                y = this.y;
                
            corners[0].x = x + (W/2)*cos(theta + PI/2);     
            corners[0].y = y + (W/2)*sin(theta + PI/2);
            corners[3].x = x + (W/2)*cos(theta + 3*PI/2); 
            corners[3].y = y + (W/2)*sin(theta + 3*PI/2);
            corners[1].x = corners[0].x + L*cos(theta); 
            corners[1].y = corners[0].y + L*sin(theta);
            corners[2].x = corners[3].x + L*cos(theta); 
            corners[2].y = corners[3].y + L*sin(theta);
            
            return corners;
        },
        
        // returns [[{x:x11,y:y11},...,{x:x14,y:y14}],...,[{x:x41,y:y41},...]]
        get_wheels : function(corners) {
            var W = WHEEL_WIDTH,
                L = WHEEL_LENGTH,
                x = this.x,
                y = this.y;
            
            for (var i = 0; i < 4; i++) {
                var theta = this.heading,
                    c = corners[i];
                
                if (1 == i || 2 == i) {
                    theta += this.steering_angle;
                }
                    
                var t1x = c.x + W*cos(theta + PI/2),    
                    t1y = c.y + W*sin(theta + PI/2),
                    t2x = c.x + W*cos(theta + 3*PI/2),  
                    t2y = c.y + W*sin(theta + 3*PI/2);
                    
                wheels[i][0].x = t1x + (L/2)*cos(theta + PI); 
                wheels[i][0].y = t1y + (L/2)*sin(theta + PI);
                wheels[i][1].x = t1x + (L/2)*cos(theta);    
                wheels[i][1].y = t1y + (L/2)*sin(theta);
                wheels[i][3].x = t2x + (L/2)*cos(theta + PI); 
                wheels[i][3].y = t2y + (L/2)*sin(theta + PI);
                wheels[i][2].x = t2x + (L/2)*cos(theta);    
                wheels[i][2].y = t2y + (L/2)*sin(theta);
            }
            
            return wheels;
        },
        
        draw : function(context) {
            this.get_corners();
            this.get_wheels(corners);

            context.lineWidth = 3;
            context.strokeStyle = "blue";
            context.beginPath();
            context.moveTo(corners[0].x, corners[0].y);
            for(i = 1; i < 4; i++) {
                context.lineTo(corners[i].x, corners[i].y);
            }
            context.closePath();
            context.stroke();
            
            context.lineWidth = 1;
            context.strokeStyle = "black";
            for (j = 0; j < 4; j++) {
                var wheel = wheels[j];
                context.beginPath();
                context.moveTo(wheel[0].x, wheel[0].y);
                for(i = 1; i < wheel.length; i++) {
                    context.lineTo(wheel[i].x, wheel[i].y);
                }
                context.closePath();
                context.stroke();
            }
        },
    };
}

var IGVC_SCALE = SCALE*2;
    IGVC_L1 = IGVC_SCALE*19, IGVC_L2 = IGVC_SCALE*10, IGVC_W = IGVC_SCALE*19.5, 
    IGVC_W1_WIDTH = IGVC_SCALE*3, IGVC_W2_WIDTH = IGVC_SCALE*2, IGVC_W3_WIDTH = IGVC_SCALE*1.25,
    IGVC_W1_LENGTH = IGVC_SCALE*10, IGVC_W2_LENGTH = IGVC_SCALE*6, IGVC_W3_LENGTH = IGVC_SCALE*6;

function IGVC_robot(x, y, heading, wheel1_velocity, wheel2_velocity, last_time_updated, time_keeper) 
{
    return {
        type : TANK,
        x : x,
        y : y,
        heading : heading,
        wheel1_velocity : wheel1_velocity,
        wheel2_velocity : wheel2_velocity,
        last_time_updated: last_time_updated,
        getTime: time_keeper.getTime,
        
        set : function (x, y, heading, wheel1_velocity, wheel2_velocity, last_time_updated) 
        {
            this.x = x;
            this.y = y;
            this.heading = heading;
            this.wheel1_velocity = wheel1_velocity;
            this.wheel2_velocity = wheel2_velocity;
            this.last_time_updated = last_time_updated;
        },
        
        update: function() {
            var cur_time = this.getTime(),
                dt = cur_time - this.last_time_updated;
            this.last_time_updated = cur_time;
            
            var x = this.x, y = this.y, theta = this.heading, L = IGVC_W, 
                Vl = this.wheel1_velocity, Vr = this.wheel2_velocity;
            
            var new_x, new_y, new_heading;
            
            if (abs(Vl - Vr) < .00001) {
                new_x = x + Vl*dt*cos(theta);
                new_y = y + Vl*dt*sin(theta);
                new_heading = theta;
            } else {
                // Credit: Dudek and Jenkin, Computational Principles of Mobile Robotics
                var R = L*(Vl + Vr)/(2*(Vr - Vl)),
                    wd = dt*(Vr - Vl)/L;
                new_x = x + R*cos(wd)*sin(theta) + R*sin(wd)*cos(theta) - R*sin(theta);
                new_y = y + R*sin(wd)*sin(theta) - R*cos(wd)*cos(theta) + R*cos(theta);
                new_heading = theta + wd;
            }
            
            new_heading = new_heading%(2*PI);
            
            this.set(new_x, new_y, new_heading, this.wheel1_velocity, 
                this.wheel2_velocity, this.last_time_updated);
        },
        
        accelerate_wheels : function(delta_wheel1_velocity, delta_wheel2_velocity) {
            var new_wheel1_velocity = this.wheel1_velocity + delta_wheel1_velocity,
                new_wheel2_velocity = this.wheel2_velocity + delta_wheel2_velocity;
            
            if (new_wheel1_velocity > MAX_V) {
                new_wheel1_velocity = MAX_V;
            } else if (new_wheel1_velocity < -MAX_V) {
                new_wheel1_velocity = -MAX_V;
            }
            
            if (new_wheel2_velocity > MAX_V) {
                new_wheel2_velocity = MAX_V;
            } else if (new_wheel2_velocity < -MAX_V) {
                new_wheel2_velocity = -MAX_V;
            }
            
            this.set(this.x, this.y, this.heading, new_wheel1_velocity, 
                new_wheel2_velocity, this.last_time_updated);
        },
        
        get_corners : function() {
            var theta = this.heading,
                x = this.x,
                y = this.y;
                
            var axel_x1 = x + (IGVC_W/2)*cos(theta + PI/2);     
                axel_y1 = y + (IGVC_W/2)*sin(theta + PI/2);
                axel_x2 = x + (IGVC_W/2)*cos(theta + 3*PI/2); 
                axel_y2 = y + (IGVC_W/2)*sin(theta + 3*PI/2);
            
            corners[0].x = axel_x1 - IGVC_L1*cos(theta); 
            corners[0].y = axel_y1 - IGVC_L1*sin(theta);
            corners[1].x = axel_x1; 
            corners[1].y = axel_y1;
            corners[2].x = axel_x1 + IGVC_L2*cos(theta); 
            corners[2].y = axel_y1 + IGVC_L2*sin(theta);
            corners[3].x = axel_x2 + IGVC_L2*cos(theta); 
            corners[3].y = axel_y2 + IGVC_L2*sin(theta);
            corners[4].x = axel_x2; 
            corners[4].y = axel_y2;
            corners[5].x = axel_x2 - IGVC_L1*cos(theta); 
            corners[5].y = axel_y2 - IGVC_L1*sin(theta);
            
            return corners;
        },
        
        // returns [[{x:x11,y:y11},...,{x:x14,y:y14}],[{x:x21,y:y21},...]]
        get_wheels : function(corners) {
            var wheel_widths = [IGVC_W3_WIDTH, IGVC_W1_WIDTH, IGVC_W2_WIDTH,
                                IGVC_W2_WIDTH, IGVC_W1_WIDTH, IGVC_W3_WIDTH],
                wheel_lengths = [IGVC_W3_LENGTH, IGVC_W1_LENGTH, IGVC_W2_LENGTH,
                                IGVC_W2_LENGTH, IGVC_W1_LENGTH, IGVC_W3_LENGTH];
            var x = this.x,
                y = this.y;
            
            for (var i = 0; i < 6; i++) {
                var W = wheel_widths[i],
                    L = wheel_lengths[i];
            
                var theta = this.heading,
                    c = corners[i],
                    side = (i < 3) ? -1 : 1;
                    
                var t1x = c.x + (W - side*W)*cos(theta + PI/2),     
                    t1y = c.y + (W - side*W)*sin(theta + PI/2),
                    t2x = c.x - (W + side*W)*cos(theta + PI/2),     
                    t2y = c.y - (W + side*W)*sin(theta + PI/2);
                    
                wheels[i][0].x = t1x + (L/2)*cos(theta + PI); 
                wheels[i][0].y = t1y + (L/2)*sin(theta + PI);
                wheels[i][1].x = t1x + (L/2)*cos(theta);    
                wheels[i][1].y = t1y + (L/2)*sin(theta);
                wheels[i][3].x = t2x + (L/2)*cos(theta + PI); 
                wheels[i][3].y = t2y + (L/2)*sin(theta + PI);
                wheels[i][2].x = t2x + (L/2)*cos(theta);    
                wheels[i][2].y = t2y + (L/2)*sin(theta);
            }
            
            return wheels;
        },
        
        draw : function(context) {
            this.get_corners();
            this.get_wheels(corners);
            
            context.lineWidth = 3;
            context.strokeStyle = "green";
            context.beginPath();
            context.moveTo(corners[0].x, corners[0].y);
            for(i = 1; i < 6; i++) {
                context.lineTo(corners[i].x, corners[i].y);
            }
            context.closePath();
            context.stroke();
            
            context.lineWidth = 1;
            context.strokeStyle = "black";
            for (j = 0; j < 6; j++) {
                var wheel = wheels[j];
                context.beginPath();
                context.moveTo(wheel[0].x, wheel[0].y);
                for(i = 1; i < wheel.length; i++) {
                    context.lineTo(wheel[i].x, wheel[i].y);
                }
                context.closePath();
                context.stroke();
            }
        }
    };
}
