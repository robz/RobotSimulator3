var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var ROWS = 20, COLS = 20;

var robot, timekeeper, lightSource, obstacle, raytracer;

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
    
    obstacles = [];
  
    var r = 30, d = 100;
    for (var i = 0; i < 100; i++) {
      var seedx = Math.random()*(canvas.width-2*d)+d,
          seedy = Math.random()*(canvas.height-2*d)+d,
          a1 = Math.random()*Math.PI*2/3,
          a2 = Math.random()*Math.PI*2/3,
          a3 = Math.random()*Math.PI*2/3;
      obstacles.push(obstacle(create_polygon([
        create_point(seedx + r*Math.cos(a1), seedy + r*Math.sin(a1)),
        create_point(seedx + r*Math.cos(a1+a2), seedy + r*Math.sin(a1+a2)),
        create_point(seedx + r*Math.cos(a1+a2+a3), seedy + r*Math.sin(a1+a2+a3)),
      ])));
    }
    
    raytracer = new Raytracer(COLS, ROWS, CANVAS_WIDTH/COLS, CANVAS_HEIGHT/ROWS, obstacles);
    
    lineStrip = line_strip(points);
    
    robot = tank_robot(
        CANVAS_WIDTH/2,
        CANVAS_HEIGHT/2,
        Math.random()*2*PI,
        0, 0, width, length, 0, timekeeper
    );
        
    robot.sensors = [
        lidar_sensor(
            raytracer,
            robot,
            0,
            robot.length/2,
            0,
            500,
            0,
            -PI,
            PI,
            100
        ),
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
        line_sensor(
            lineStrip,
            robot,
            0,
            robot.length,
            robot.width,
            8
        ),
    ];

    setInterval("timekeeper.update(50);", 50);
    setInterval(paintCanvas, 40);
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
    
    if (points && points.length != 0) {
        context.strokeStyle = "blue";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();
    }

    context.strokeStyle = "black";
    context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
 
    robot.update();
    context.strokeStyle = "green";
    robot.draw(context);
    
    context.lineWidth = 1;
    for (var i = 0; i < robot.sensors.length; i++) { 
        context.strokeStyle = "black";
        context.fillStyle = "black";
        robot.sensors[i].draw(context);
    }
}

/*
//
// Functions for creating a line
//

var mouseIsDown = false;

function mousedown() {
    mouseIsDown = true;
    points = [];
}

function mouseup() {
    mouseIsDown = false;
    var reducedPoints = [];
    for (var i = 0; i < points.length; i+=10) {
        reducedPoints.push(points[i]);
    }
    console.log(JSON.stringify(reducedPoints));
}

function mousemove(event) {
    var point;
    
    if(event.offsetX) {
        point = {x: event.offsetX, y: event.offsetY};
    }
    else if(event.layerX) {
        point = {x: event.layerX-canvas.offsetLeft, 
                 y: event.layerY-canvas.offsetTop};
    }

    if (point && mouseIsDown) {
        points.push(point);
    }
}
*/
