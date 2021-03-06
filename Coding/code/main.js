var PI = Math.PI, 
    MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69,
    CANVAS_HEIGHT, CANVAS_WIDTH;

var raytracecols = 8, raytracerows = 12;

var robot, timekeeper, wall_following_field, line_following_field, pauseBtn, obstacles, progCodeMirrors, current_tab = 0;

var programFirstLoaded = false, pauseProgram = true, programStatusText = "running manual";

var tabberOptions = {
    'onClick': function(args) {
        current_tab = args.index;
        setTimeout(progCodeMirrors[1].refresh, 0);
    }
};

window.onload = function() 
{    
    var canvas = document.getElementById("canvas");
    CANVAS_HEIGHT = canvas.height;
    CANVAS_WIDTH = canvas.width;

    pauseBtn = document.getElementById("pauseBtn");
    var heightstr = getComputedStyle(pauseBtn).height;
    var btnheight = parseFloat(heightstr.substring(0, heightstr.length-2));
    
    obstacles = create_obstacles();
    init_robot(obstacles);
    
    progCodeMirrors = new Array(2);
    
    wall_following_field = document.getElementById("wall_following_program");
    progCodeMirrors[0] = CodeMirror.fromTextArea(wall_following_field);
    progCodeMirrors[0].getScrollerElement().style.height = CANVAS_HEIGHT - btnheight - 40;
    
    sendRequest("code/wall_following.js", function(xmlhttp_request) {
        progCodeMirrors[0].setValue(xmlhttp_request.responseText);
    });
    
    line_following_field = document.getElementById("line_following_program");
    progCodeMirrors[1] = CodeMirror.fromTextArea(line_following_field);
    progCodeMirrors[1].getScrollerElement().style.height = CANVAS_HEIGHT - btnheight - 40;
    
    sendRequest("code/line_following.js", function(xmlhttp_request) {
        progCodeMirrors[1].setValue(xmlhttp_request.responseText);
    });
    
    setStatusText("currently in manual mode");
    setInterval(program_iteration, 100);
}

function program_iteration() {
    if (!programFirstLoaded || pauseProgram) return;
    
    program_loop(robot);
}

function add_code(programText) {
    var newscriptElem = document.createElement("script");
    newscriptElem.appendChild(document.createTextNode(programText));
    document.childNodes[0].childNodes[0].appendChild(newscriptElem);
}

function init_robot(obstacles) {
    width = 40*SCALE;
    length = 40*SCALE;
    startx = 150;
    starty = 100;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    raytracer = new Raytracer(
                  raytracecols, raytracerows, 
                  CANVAS_WIDTH/raytracecols, 
                  CANVAS_HEIGHT/raytracerows, obstacles);
    
    robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);
    robot.obstacles = obstacles;
    robot.distance_sensor = distance_sensor(raytracer, robot, 0, robot.length/2, 0, 500, 0);
    robot.line_sensor = line_sensor(line_strip(linesensor_points), robot, 0, robot.length, robot.width*2/3, 8);
    robot.sensors = [
        robot.distance_sensor,
        robot.line_sensor,
    ];

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
}

function loadBtnClicked(event) 
{
    setStatusText("program loaded!");
    programFirstLoaded = true;
    add_code(progCodeMirrors[current_tab].getValue());
}

function pauseBtnClicked(event) 
{
    if (!programFirstLoaded) {
        setStatusText("<div style=\"color: red;\">no program loaded! hit 'load' to load a program before running it.</div>");
        return;
    }

    pauseProgram = !pauseProgram;

    if (pauseProgram) {
        setStatusText("program stopped! (manual mode)");
        robot.set_wheel_velocities(0, 0);
        pauseBtn.innerHTML = "RUN";
    } else {
        setStatusText("program running! (autonomous mode)");
        program_init(robot);
        pauseBtn.innerHTML = "STOP";
    }
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
        event.preventDefault();
    } else {
        return;
    }
    
    robot.update();
    robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
}

function setStatusText(text) {
    document.getElementById("status_text").innerHTML = text;
}   

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.strokeStyle = "blue";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(linesensor_points[0].x, linesensor_points[0].y);
    for (var i = 1; i < linesensor_points.length; i++) {
        context.lineTo(linesensor_points[i].x, linesensor_points[i].y);
    }
    context.stroke();
        
    context.strokeStyle = "green";
    context.lineWidth = 1;
    robot.update();
    robot.draw(context);
    
    context.strokeStyle = "black";
    context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
    
    context.strokeStyle = "black";
    context.lineWidth = 1;
    for (var i = 0; i < robot.sensors.length; i++) {
        robot.sensors[i].draw(context);
    }
}

function create_obstacles() {
    var obstacles = [
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
            {x:709.2592592592592-150,y:383.90625-150},
            {x:627.7777777777778-150,y:391.56250-150},
            {x:531.4814814814815-150,y:412.34375-150},
            {x:533.3333333333334-150,y:502.03125-150},
            {x:581.4814814814815-150,y:557.81250-150},
            {x:651.8518518518518-150,y:550.15625-150},
            {x:722.2222222222222-150,y:496.56250-150},
        ])),
    ];
    
    // Scale the obstacles to the size of the canvas
    
    var scalex = CANVAS_WIDTH/1000,
        scaley = CANVAS_HEIGHT/700;
    
    for (var i = 0; i < obstacles.length; i++) {
        var old_points = obstacles[i].polygon.points;
        var scaled_points = new Array(old_points.length);
        
        for (var j = 0; j < scaled_points.length; j++) {
            scaled_points[j] = {
                x: old_points[j].x*scalex,
                y: old_points[j].y*scaley
            };
        }
        
        obstacles[i] = obstacle(create_polygon(scaled_points));
    }
    
    obstacles = obstacles.concat([
        obstacle(create_boxpoly(0,0,5,CANVAS_HEIGHT)),
        obstacle(create_boxpoly(CANVAS_WIDTH-5,0,5,CANVAS_HEIGHT)),
        obstacle(create_boxpoly(0,0,CANVAS_WIDTH,5)),
        obstacle(create_boxpoly(0,CANVAS_HEIGHT-5,CANVAS_WIDTH,5))
    ]);
        
    return obstacles;
}
