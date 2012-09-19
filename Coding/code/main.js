var PI = Math.PI, DELTA_ALPHA = PI/20, DELTA_V = .005, 
	KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var robot, timekeeper;

window.onload = function() 
{
	width = 40*SCALE;
	length = 40*SCALE;
	startx = 300/2;
	starty = 100;
	
	timekeeper = gametime_timekeeper();
	timekeeper.init();
	
	robot = tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper);

	setInterval("timekeeper.update(10);", 10);
	setInterval(paintCanvas, 30);
}

function keydown(event) 
{
    console.log("hi!");
	keydown_tank(event, robot);
}

function keydown_tank(event, my_robot) 
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
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
		
	context.fillStyle = "lightGray";
	context.fillRect(0, 0, canvas.width, canvas.height);
		
	robot.update();
	robot.draw(context);
}
