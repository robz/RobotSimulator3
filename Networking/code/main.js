var PI = Math.PI, MAX_V = .1, DELTA_ALPHA = PI/20, DELTA_V = .005, 
	KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var my_robot, server_robot, canvas, context;

window.onload = function() 
{
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
	width = 40*SCALE;
	length = 40*SCALE;
	startx = 300/2;
	starty = 100;
	
	timekeeper = gametime_timekeeper();
	timekeeper.init();
    my_robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);
    server_robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
    
    server_push_poll();
    server_pull_poll();
}

// var myObject = JSON.parse(myJSONtext);
// var myJSONText = JSON.stringify(myObject);

function server_push_poll() {
    var myJSONText = JSON.stringify({x: my_robot.x, y: my_robot.y, heading: my_robot.heading});
    
    postFile("data/robotstate.txt", myJSONText, true, function(xmlhttp_request) {
        setTimeout(server_push_poll, 50);
    });
}

function server_pull_poll() {
    sendRequest("data/robotstate.txt", function(xmlhttp_request) {
        try {
            var robotstate = JSON.parse(xmlhttp_request.responseText);
            server_robot.x = robotstate.x;
            server_robot.y = robotstate.y;
            server_robot.heading = robotstate.heading;
        } catch (err) {
            console.log(err);
        }
        setTimeout(server_pull_poll, 50);
    });
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
		delta_wheel1_velocity = -my_robot.wheel1_velocity;
		delta_wheel2_velocity = -my_robot.wheel2_velocity;
	} else {
		return;
	}
	
	my_robot.update();
	my_robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
}

function paintCanvas() 
{
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
	my_robot.update();
    server_robot.draw(context);
}

