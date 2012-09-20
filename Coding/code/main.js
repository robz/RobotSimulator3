var PI = Math.PI, DELTA_ALPHA = PI/20, DELTA_V = .005, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var robot, timekeeper, programField, pauseBtn;

var programFirstLoaded = false, pauseProgram = false;

window.onload = function() 
{    
    programField = document.getElementById("programField");
    init_robot();
    
    var setupProgramField = function(xmlhttp_request) {
        programField.value = xmlhttp_request.responseText;
        setInterval(program_iteration, 100);
    }
    programField.value = sendRequest("code/default_program.js", setupProgramField);

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

function init_robot() {
    width = 40*SCALE;
    length = 40*SCALE;
    startx = 150;
    starty = 100;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
}

function loadBtnClicked(event) 
{
    programFirstLoaded = true;
    add_code(programField.value);
}

function pauseBtnClicked(event) 
{
    pauseProgram = !pauseProgram;

    if (pauseProgram) {
        pauseBtn.innerText = "start";
    } else {
        pauseBtn.innerText = "stop";
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
        
    robot.update();
    robot.draw(context);
}
