var ga, timekeeper;

function go(ctx) {
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    ga = new create_ga(timekeeper, 20, 40*SCALE, 40*SCALE);
    
    setInterval(updateGA, 10);
}

function updateGA() {
    timekeeper.update(10);
    ga.update();
    ga.render_state();
}

function create_ga(timekeeper, num_robots, width, length) {
    this.robots = new Array(num_robots);
    
    this.sources = [
        light_source(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, SOURCE_VAR*3/4 )
    ];
    
    for (var i = 0; i < num_robots; i++) {
        startx = Math.random()*(CANVAS_WIDTH-200)+100;
        starty = Math.random()*(CANVAS_HEIGHT-200)+100;
        startdir = Math.random()*2*PI;
        
        this.robots[i] = tank_robot(startx, starty, startdir, 0, 0, width, length, 0, timekeeper);
        
        var lightsensor1 = light_sensor(
                                this.sources,
                                this.robots[i], 
                                my_atan(this.robots[i].width/2, this.robots[i].length), 
                                Math.sqrt(this.robots[i].width*this.robots[i].width 
                                        + this.robots[i].length*this.robots[i].length/4));

        var lightsensor2 = light_sensor(
                                this.sources,
                                this.robots[i], 
                                my_atan(-this.robots[i].width/2, this.robots[i].length), 
                                Math.sqrt(this.robots[i].width*this.robots[i].width
                                        + this.robots[i].length*this.robots[i].length/4));
            
        this.robots[i].sensors = [lightsensor1, lightsensor2];
        
        this.robots[i].bbconsts = [[-1,0,1],[0,1,1]];
    }
    
    this.update = function() {
        for (var i = 0; i < num_robots; i++) {
            this.robots[i].update();
            update_brait(this.robots[i]);
        }
    }
    
    this.render_state = function() {
        var ctx = document.getElementById("canvas").getContext("2d");
        
        ctx.fillStyle = "lightGray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = "green";
        for (var i = 0; i < num_robots; i++) {
            ctx.strokeStyle = "green";
            this.robots[i].draw(ctx, false);
        }
        
        ctx.fillStyle = "orange";
        drawSources(ctx, this.sources);
    }
}

function update_brait(robot) {
    var sense1 = robot.sensors[0].val,
        sense2 = robot.sensors[1].val;
        
	//robot.wheel1_velocity = 1 - sense2;
    //robot.wheel2_velocity = 1 - sense1;
    
	robot.wheel1_velocity = 1 - sense2;
    robot.wheel2_velocity = 1 - sense1;
}





































