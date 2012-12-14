var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;


var myID = Math.floor(Math.random()*9999999);
var robot, other_robots = {};
var network_object = {};

window.onload = function() {
    statusDiv = document.getElementById("godcs_status");
    
    init_robot();
    writeBack(network_object);
    
    requestFile(writeToTextField);
}

function dealWithUpdate() {
    var obj = network_object;
    
    for (var key in obj) {
        if (key != myID && obj.hasOwnProperty(key)) {
            if (!other_robots.hasOwnProperty(key)) {
                other_robots[key] = tank_robot(CANVAS_WIDTH/2, CANVAS_HEIGHT/2,
                                               0, 0, 0, 40, 40, 0, timekeeper);
            }
            
            var state = obj[key];
            other_robots[key].update();
            other_robots[key].set_wheel_velocities(state.vel1, state.vel2);
            other_robots[key].x = state.x;
            other_robots[key].y = state.y;
            other_robots[key].heading = state.dir;
        }
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
	    event.preventDefault();
		delta_wheel1_velocity = -robot.wheel1_velocity;
		delta_wheel2_velocity = -robot.wheel2_velocity;
	} else {
		return;
	}
	
	robot.update();
	robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
    
    network_object[myID] = {vel1: robot.wheel1_velocity, 
                            vel2: robot.wheel2_velocity,
                            x: robot.x,
                            y: robot.y,
                            dir: robot.heading};
	writeBack(network_object);
}
    
function init_robot() {
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;
    
    timekeeper = realtime_timekeeper();
    //timekeeper.init();
    
    robot = tank_robot(CANVAS_WIDTH/2, CANVAS_HEIGHT/2,
        0, 0, 0, 40, 40, 0, timekeeper
    );
    
    //setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 40);
}

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
 
    context.strokeStyle = "green";
    robot.update();
    robot.draw(context);
    
    context.strokeStyle = "darkgray";
    for (var key in other_robots) {
        if (key != myID && other_robots.hasOwnProperty(key)) {
            other_robots[key].update();
            other_robots[key].draw(context);
        }
        context.strokeStyle = "gray";
    }
}
















