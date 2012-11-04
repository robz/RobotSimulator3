var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69, KEY_q = 81;

var robot, my_dist_sensor, timekeeper, obstacles, my_particle_filter, my_kalman_filter;

window.onload = function() 
{
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    obstacles = make_obstacles();
    
    robot = tank_robot(
        CANVAS_WIDTH/2,
        CANVAS_HEIGHT/2,
        Math.random()*2*PI,
        0, 
        0, 
        40*SCALE, 
        40*SCALE, 
        0, 
        timekeeper
    );
    
    my_dist_sensor = dist_sensor(
                        obstacles,
                        robot,
                        0,
                        robot.length/2,
                        0,
                        500,
                        0.005
                        );
        
    robot.sensors = [my_dist_sensor];
    
    my_particle_filter = new particle_filter(
                                obstacles,
                                my_dist_sensor,
                                300, 
                                CANVAS_WIDTH/3, 
                                CANVAS_HEIGHT/3, 
                                CANVAS_WIDTH/3, 
                                CANVAS_HEIGHT/3, 
                                2*Math.PI
                                );
    
    // process uncertainty covariance
    Q = $M([[1e-4,0,0,0,0,0], 
            [0,1e-4,0,0,0,0], 
            [0,0,1e-4,0,0,0],
            [0,0,0,1e-4,0,0], 
            [0,0,0,0,1e-4,0], 
            [0,0,0,0,0,1e-4]]);	
            
    my_kalman_filter = new kalman_filter(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 40, Q);
    my_kalman_filter.verbosity_level = 0;

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
    setInterval(runFilters, 100);
}

function runFilters() {
    my_particle_filter.iterate( 
        robot.sensors[0].val,
        robot.sensors[0].offset_heading
        );
        
    my_kalman_filter.iterate(
        my_particle_filter.best_guess.x,
        my_particle_filter.best_guess.y
        );
}

function keydown(event) 
{
    var key = event.which;
    console.log(key);
    
    var delta_wheel1_velocity = 0, 
        delta_wheel2_velocity = 0;
    
    if (key == KEY_w) {
        delta_wheel1_velocity = DELTA_V;
        delta_wheel2_velocity = DELTA_V;
    } else if (key == KEY_s) {
        delta_wheel1_velocity = -DELTA_V;
        delta_wheel2_velocity = -DELTA_V;
    } else if (key == KEY_a) {
        delta_wheel1_velocity = DELTA_V;
        delta_wheel2_velocity = -DELTA_V;
    } else if (key == KEY_d) {
        delta_wheel1_velocity = -DELTA_V;
        delta_wheel2_velocity = DELTA_V;
    } else if (key == KEY_space) {
        delta_wheel1_velocity = -robot.wheel1_velocity;
        delta_wheel2_velocity = -robot.wheel2_velocity;
    } else if (key == KEY_e) {
        my_particle_filter.verbosity_level = (my_particle_filter.verbosity_level+1)%3;
    } else if (key == KEY_q) {
        my_kalman_filter.verbosity_level = (my_kalman_filter.verbosity_level+1)%2;
    } else {
        return;
    }
    
    robot.update();
    robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
}

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
 
    context.fillStyle = "orange"; 

    context.strokeStyle = "black";
    context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
    
    context.fillStyle = "gray";
    context.strokeStyle = "gray";
    my_particle_filter.drawParticles(context, false);
 
    robot.update();
    context.strokeStyle = "green";
    robot.draw(context);
     
    context.fillStyle = "black";
    context.strokeStyle = "black";
    for (var i = 0; i < robot.sensors.length; i++) {
        robot.sensors[i].draw(context);
    }
    
    my_kalman_filter.draw(context);
}


function make_obstacles() {
    return [
        obstacle(create_boxpoly(0,0,5,CANVAS_HEIGHT)),
        
        obstacle(create_boxpoly(CANVAS_WIDTH-5,0,5,CANVAS_HEIGHT)),
        
        obstacle(create_boxpoly(0,0,CANVAS_WIDTH,5)),
        
        obstacle(create_boxpoly(0,CANVAS_HEIGHT-5,CANVAS_WIDTH,5)),
        
        obstacle(create_polygon([
            {x:9.25925925925926,y:205.625},
            {x:57.407407407407405,y:214.375},
            {x:68.51851851851852,y:319.375},
            {x:72.22222222222223,y:413.4375},
            {x:48.148148148148145,y:448.4375},
            {x:9.25925925925926,y:453.90625},
        ])),
        
        obstacle(create_polygon([
            {x:292.5925925925926,y:5.46875},
            {x:303.7037037037037,y:44.84375},
            {x:346.2962962962963,y:62.34375},
            {x:438.8888888888889,y:67.8125},
            {x:601.8518518518518,y:61.25},
            {x:657.4074074074074,y:29.53125},
            {x:657.4074074074074,y:5.46875},
        ])),
        
        obstacle(create_polygon([
            {x:990.7407407407408,y:157.5},
            {x:922.2222222222222,y:190.3125},
            {x:907.4074074074074,y:351.09375},
            {x:946.2962962962963,y:494.375},
            {x:990.7407407407408,y:510.78125},
        ])),
        
        obstacle(create_polygon([
            {x:9.25925925925926,y:602.65625},
            {x:79.62962962962963,y:601.5625},
            {x:151.85185185185185,y:638.75},
            {x:150,y:696.71875},
            {x:9.25925925925926,y:696.71875},
        ])),
        
        obstacle(create_polygon([
            {x:996.2962962962963,y:600.46875},
            {x:911.1111111111111,y:590.625},
            {x:822.2222222222222,y:614.6875},
            {x:742.5925925925926,y:647.5},
            {x:694.4444444444445,y:696.71875},
            {x:994.4444444444445,y:696.71875},
        ])),
        
        obstacle(create_polygon([
            {x:381.48148148148147,y:271.25},
            {x:548.1481481481482,y:266.875},
            {x:718.5185185185185,y:246.09375},
            {x:670.3703703703703,y:167.34375},
            {x:492.5925925925926,y:160.78125},
            {x:298.14814814814815,y:172.8125},
            {x:251.85185185185185,y:225.3125},
            {x:283.3333333333333,y:253.75},
        ])),
        
        obstacle(create_polygon([
            {x:333.3333333333333,y:371.875},
            {x:220.37037037037038,y:362.03125},
            {x:211.11111111111111,y:399.21875},
            {x:225.92592592592592,y:485.625},
            {x:303.7037037037037,y:551.25},
            {x:375.9259259259259,y:551.25},
            {x:431.48148148148147,y:531.5625},
            {x:422.22222222222223,y:452.8125},
        ])),
        
        obstacle(create_polygon([
            {x:709.2592592592592,y:383.90625},
            {x:627.7777777777778,y:391.5625},
            {x:531.4814814814815,y:412.34375},
            {x:533.3333333333334,y:502.03125},
            {x:581.4814814814815,y:557.8125},
            {x:651.8518518518518,y:550.15625},
            {x:722.2222222222222,y:496.5625},
        ])),
    ];
}
