var PI = Math.PI, 
    MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69,
    CANVAS_HEIGHT, CANVAS_WIDTH;

var robot, timekeeper, programField, pauseBtn, obstacles, progCodeMirror;

var programFirstLoaded = false, pauseProgram = true;

window.onload = function() 
{    
    var canvas = document.getElementById("canvas");
    CANVAS_HEIGHT = canvas.height;
    CANVAS_WIDTH = canvas.width;

    var heightstr = getComputedStyle(document.getElementById("loadBtn")).height;
    var btnheight = parseFloat(heightstr.substring(0, heightstr.length-2));
    
    programField = document.getElementById("programField");
    progCodeMirror = CodeMirror.fromTextArea(programField);
	progCodeMirror.getScrollerElement().style.height = CANVAS_HEIGHT - btnheight;
    
    obstacles = create_obstacles();
    init_robot(obstacles);
    
    var setupProgramField = function(xmlhttp_request) {
        progCodeMirror.setValue(xmlhttp_request.responseText);
        setInterval(program_iteration, 100);
    }
    sendRequest("code/default_program.js", setupProgramField);

    pauseBtn = document.getElementById("pauseBtn");
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
    
    robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);

    robot.obstacles = obstacles;
    robot.dist_sensor = dist_sensor(obstacles, robot, 0, robot.length/2, 0, 500, 0);
    robot.sensors = [
        robot.dist_sensor
    ];

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
}

function loadBtnClicked(event) 
{
    programFirstLoaded = true;
    add_code(progCodeMirror.getValue());
}

function pauseBtnClicked(event) 
{
    pauseProgram = !pauseProgram;

    if (pauseProgram) {
        robot.set_wheel_velocities(0, 0);
        pauseBtn.innerText = "RUN";
    } else if (!pauseProgram && programFirstLoaded) {
        program_init(robot);
        pauseBtn.innerText = "STOP";
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
        
    context.strokeStyle = "green";
    context.lineWidth = 1;
    robot.update();
    robot.draw(context);
    
    context.strokeStyle = "black";
    context.lineWidth = 3;
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
    
    context.strokeStyle = "darkGray";
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
