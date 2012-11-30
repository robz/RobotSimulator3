var PI = Math.PI, MAX_V = .5, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var NUM_ROBOTS = 2000, SOURCE_VAR = 100;

var ga, timekeeper;

var flag = false;

window.onload = function() 
{
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    ga = new create_ga(timekeeper, NUM_ROBOTS, 40*SCALE, 40*SCALE);
    
    setInterval(updateGA, 10);
}

function updateGA() {
    timekeeper.update(4);
    ga.update();
    ga.render_state();
    
    if (ga.robots.length == 10 && !flag) {
        for (var i = 0; i < ga.robots.length; i++) {
            console.log(ga.robots[i].bbconsts);
        }
        flag = true;
    }
}

function create_ga(timekeeper, num_robots, width, length) {
    this.robots = new Array(num_robots);
    
    this.sources = [
        light_source(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, SOURCE_VAR*3/4 )
    ];
    
    for (var i = 0; i < num_robots; i++) {
        this.robots[i] = buildRobot(this.sources, width, length);
        this.robots[i].bbconsts = getRandomBBConsts();
    }
    
    this.update = function() {
        for (var i = 0; i < num_robots; i++) {
            if (this.robots[i] == null) continue;
        
            this.robots[i].update();
            
            // loop around
        
            if (this.robots[i].x < 0) {
                this.robots[i].x += CANVAS_WIDTH;
            } else if (this.robots[i].x > CANVAS_WIDTH) {
                this.robots[i].x -= CANVAS_WIDTH;
            }
            
            if (this.robots[i].y < 0) {
                this.robots[i].y += CANVAS_HEIGHT;
            } else if (this.robots[i].y > CANVAS_HEIGHT) {
                this.robots[i].y -= CANVAS_HEIGHT;
            }
            
            update_brait(this.robots[i]);
            update_health(this.robots[i], this.sources);
            
            if (this.robots[i].health < 0) {
                delete this.robots.splice(i, 1);
                i--;
            }   
        }
        
        console.log(this.robots.length);
        var len = this.robots.length;
        for (var i = len-1; i >= 0; i--) {
            if (this.robots.length < num_robots && this.robots[i].health > 1000) {
                var robot = buildRobot(this.sources, width, length);
                robot.bbconsts = modifyBBConsts(this.robots[i].bbconsts);
                this.robots.push(robot);
                this.robots[i].health -= 500;
            }
        }
    }
    
    this.render_state = function() {
        var ctx = document.getElementById("canvas").getContext("2d");
        
        ctx.fillStyle = "lightGray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 120, 0, 2*PI, false);
        ctx.fill();
        
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 100, 0, 2*PI, false);
        ctx.fill();
        
        ctx.strokeStyle = "black";
        for (var i = 0; i < num_robots; i++) {
            if (!this.robots[i]) {
                continue;
            }
            this.robots[i].draw(ctx, true);
        }
    }
}

function buildRobot(sources, width, length) {
    startx = Math.random()*(CANVAS_WIDTH-100)+50;
    starty = Math.random()*(CANVAS_HEIGHT-100)+50;
    startdir = Math.random()*2*PI;
        
    robot = tank_robot(startx, starty, startdir, 0, 0, width, length, 0, timekeeper);
        
    var lightsensor1 = light_sensor(
                            sources,
                            robot, 
                            my_atan(robot.width/2, robot.length), 
                            Math.sqrt(robot.width*robot.width 
                                    + robot.length*robot.length/4));
                                    
    var lightsensor2 = light_sensor(
                            sources,
                            robot, 
                            my_atan(-robot.width/2, robot.length), 
                            Math.sqrt(robot.width*robot.width 
                                    + robot.length*robot.length/4));
            
    robot.sensors = [lightsensor1, lightsensor2];
    robot.health = 100;
    
    return robot;
}

function update_brait(robot) {
    var sense1 = robot.sensors[0].val,
        sense2 = robot.sensors[1].val;
    
    var c = robot.bbconsts;
    
	robot.wheel1_velocity = c[0][0]*sense1 + c[0][1]*sense2 + c[0][2];
    robot.wheel2_velocity = c[1][0]*sense1 + c[1][1]*sense2 + c[1][2];
}

function update_health(robot, sources) {
    var distToSource = Math.sqrt((robot.x-sources[0].x)*(robot.x-sources[0].x) + 
                                 (robot.y-sources[0].y)*(robot.y-sources[0].y));
    
    robot.health -= 1;
    if (distToSource < 50) {
        robot.health += 10;
    }
}


function modifyBBConsts(consts) {
    
    var c = [[ consts[0][0] + .02*Math.random()-.01,
               consts[0][1] + .02*Math.random()-.01,
               consts[0][2] + .02*Math.random()-.01 ],
             [ consts[1][0] + .02*Math.random()-.01,
               consts[1][1] + .02*Math.random()-.01,
               consts[1][2] + .02*Math.random()-.01 ]];

    while (!validDNA(c[0][0], c[0][1], c[0][2])) {
        c[0][0] = consts[0][0] + .02*Math.random()-.01;
        c[0][1] = consts[0][1] + .02*Math.random()-.01;
        c[0][2] = consts[0][2] + .02*Math.random()-.01;
   }
        
    while (!validDNA(c[1][0], c[1][1], c[1][2])) {
        c[1][0] = consts[1][0] + .02*Math.random()-.01;
        c[1][1] = consts[1][1] + .02*Math.random()-.01;
        c[1][2] = consts[1][2] + .02*Math.random()-.01;
    }
    
    return c;
}

function getRandomBBConsts() {
    var c = [[2*Math.random()-1,2*Math.random()-1,2*Math.random()-1],
             [2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]];
    
    while (!validDNA(c[0][0], c[0][1], c[0][2]) || !validDNA(c[1][0], c[1][1], c[1][2])) {
        c[0][0] = 2*Math.random()-1;
        c[0][1] = 2*Math.random()-1;
        c[0][2] = 2*Math.random()-1;
        c[1][0] = 2*Math.random()-1;
        c[1][1] = 2*Math.random()-1;
        c[1][2] = 2*Math.random()-1;
    }
    
    return c; 
}

function validDNA(x, y, z) {
	return 1 >= z && z >= -1
		&& 1 >= x+z && x+z >= -1
		&& 1 >= y+z && y+z >= -1
		&& 1 >= x+y+z && x+y+z >= -1;
}
