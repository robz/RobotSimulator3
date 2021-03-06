var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69, KEY_q = 81;

var canvas, reality_context, perception_context;
var robot, obstacles, map_builder;

var num_obstacles = 10,
    obstacle_pad = 30,
    obstacle_radius = 30,
	raytracecols = 15,  
    raytracerows = 15,
    map_builder_period = 100,
	paint_period = 30,
	RAY_LENGTH = 180,
	NUM_RAYS = 100,
	MAP_ROWS = 60,
	MAP_COLS = 60;

window.onload = function() 
{
    canvas = document.getElementById("reality");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;
	reality_context = canvas.getContext("2d");
	perception_context = document.getElementById("perception").getContext("2d");

    make_obstacles();
   	make_robot();
   	map_builder = new MapBuilder(robot.x, robot.y, robot.heading, robot.width, MAP_ROWS, MAP_COLS);

    setTimeout(paintCanvas, paint_period);
    setTimeout(update_builder, map_builder_period);
}

var prev_time = 0;

function update_builder() {
    var dt = 0,
        cur_time = new Date().getTime();
    if (prev_time != 0) {
        dt = cur_time - prev_time;
    }
    prev_time = cur_time;
    
    map_builder.update(robot.wheel1_velocity, 
                       robot.wheel2_velocity, 
                       robot.lidar_sensor, 
                       dt);
	
    setTimeout(update_builder, map_builder_period);
}

function keydown(event) 
{
    var key = event.which;
    
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
    } else {
        return;
    }
    
    robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
}

function paintCanvas() 
{  
	perception_context.fillStyle = "lightGray";
    perception_context.fillRect(0, 0, canvas.width, canvas.height);
	
    map_builder.draw(perception_context);
 
    reality_context.fillStyle = "lightGray";
    reality_context.fillRect(0, 0, canvas.width, canvas.height);
	
    robot.update();
	
    reality_context.fillStyle = "black";
    reality_context.strokeStyle = "black";
    for (var i = 0; i < robot.sensors.length; i++) {
        robot.sensors[i].draw(reality_context);
    }
    
    reality_context.strokeStyle = "blue";
    reality_context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(reality_context);
    }
	
    reality_context.strokeStyle = "green";
    robot.draw(reality_context);
	
    setTimeout(paintCanvas, paint_period);
}

function make_robot() {
    robot = tank_robot(
                CANVAS_WIDTH/2,
                CANVAS_HEIGHT/2,
                0,
                0, 
                0, 
                40*SCALE, 
                40*SCALE, 
                0, 
                realtime_timekeeper()
                );
    
    var raytracer = new Raytracer(
							raytracecols, 
							raytracerows, 
							CANVAS_WIDTH/raytracecols, 
							CANVAS_HEIGHT/raytracerows, 
							obstacles
							);
    
    robot.lidar_sensor = lidar_sensor(
                            raytracer, 
                            robot, 
                            0, 
                            0, 
                            0, 
                            RAY_LENGTH, 
                            0, 
                            -PI/2, 
                            PI/2, 
                            NUM_RAYS
                            );
        
    robot.sensors = [robot.lidar_sensor];
}

function make_obstacles() {
	obstacles = new Array(num_obstacles);

	for (var i = 0; i < num_obstacles; i++) {
        var seedx = Math.random()*(CANVAS_WIDTH - 2*obstacle_pad) + obstacle_pad,
            seedy = Math.random()*(CANVAS_HEIGHT - 2*obstacle_pad) + obstacle_pad,
            a1 = Math.random()*(Math.PI*2/3 - Math.PI/6) + Math.PI/6,
            a2 = Math.random()*(Math.PI*2/3 - Math.PI/6) + Math.PI/6,
            a3 = Math.random()*(Math.PI*2/3 - Math.PI/6) + Math.PI/6;
            
        obstacles[i] = obstacle(create_polygon([
          create_point(seedx + obstacle_radius*Math.cos(a1), 
                       seedy + obstacle_radius*Math.sin(a1)),
          create_point(seedx + obstacle_radius*Math.cos(a1+a2), 
                       seedy + obstacle_radius*Math.sin(a1+a2)),
          create_point(seedx + obstacle_radius*Math.cos(a1+a2+a3), 
                       seedy + obstacle_radius*Math.sin(a1+a2+a3)),
        ]));
    };
}































