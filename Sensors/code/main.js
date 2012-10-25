var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var robot, timekeeper, lightSource, obstacle;

window.onload = function() 
{
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;

    width = 40*SCALE;
    length = 40*SCALE;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();

    lightSource = light_source( 
        Math.random()*(CANVAS_WIDTH-100)+50,
        Math.random()*(CANVAS_HEIGHT-100)+50,
        100
    );

    obstacles = [
        obstacle(create_polygon([
            create_point(20,20), 
            create_point(150,250),
            create_point(200,150)])),
        obstacle(create_polygon([
            create_point(600, 50),
            create_point(620, 200),
            create_point(700, 210),
            create_point(690, 43)])),
        obstacle(create_polygon([
            create_point(300, 500),
            create_point(500, 450),
            create_point(800, 500),
            create_point(800, 670),
            create_point(250, 650)]))
    ];
    
    robot = tank_robot(
        CANVAS_WIDTH/2,
        CANVAS_HEIGHT/2,
        Math.random()*2*PI,
        0, 0, width, length, 0, timekeeper
    );
        
    robot.sensors = [
        light_sensor(
            [lightSource],
            robot, 
            my_atan(-robot.width/2, robot.length),
            Math.sqrt(robot.width*robot.width/4 + robot.length*robot.length)
        ),
        light_sensor(
            [lightSource],
            robot, 
            my_atan(robot.width/2, robot.length),
            Math.sqrt(robot.width*robot.width/4 + robot.length*robot.length)
        ),
        dist_sensor(
            obstacles,
            robot,
            0,
            robot.length/2,
            0,
            500,
            0
        )];

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
}

function keydown(event) 
{
      var key = event.which;
    
      var delta_wheel1_velocity = 0, delta_wheel2_velocity = 0;
    
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
    lightSource.draw(context);

    context.strokeStyle = "black";
    context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
 
    robot.update();
    context.strokeStyle = "green";
    robot.draw(context);
     
    context.fillStyle = "black";
    context.strokeStyle = "black";
    for (var i = 0; i < robot.sensors.length; i++) {
        robot.sensors[i].draw(context);
    }
}
