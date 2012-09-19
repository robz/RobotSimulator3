var PI = Math.PI, DELTA_ALPHA = PI/20, DELTA_V = .005, 
	KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var robots, timekeeper;

window.onload = function() 
{
	width = 40*SCALE;
	length = 40*SCALE;
	startx = 300/2;
	starty = 100;
	
	timekeeper = gametime_timekeeper();
	timekeeper.init();
	
	robots = [
		ackerman_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper),
		tank_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper),
		//IGVC_robot(startx, starty, PI/2, 0, 0, 0, timekeeper),
		crab_robot(startx, starty, PI/2, 0, 0, width, length, 0, timekeeper)
		];

	setInterval("timekeeper.update(10);", 10);
	setInterval(paintCanvas, 30);
}

function keydown(event, index) 
{
	if (robots[index].type == ACKERMAN || robots[index].type == CRAB) {
		keydown_ackerman_crab(event, robots[index]);
	} else if (robots[index].type == TANK) {
		keydown_tank(event, robots[index]);
	} else if (robots[index].type == COLUMBIA) {
		keydown_columbia(event, robots[index]);
	}
}

function keydown_test_tank(event, my_robot) 
{
	var key = event.which;
	
	var delta_wheel1_velocity = 0, delta_wheel2_velocity = 0;
	
	if (key == KEY_w) {
		delta_wheel2_velocity = DELTA_V;
	} else if (key == KEY_s) {
		delta_wheel2_velocity = -DELTA_V;
	} else if (key == KEY_e) {
		delta_wheel1_velocity = DELTA_V;
	} else if (key == KEY_d) {
		delta_wheel1_velocity = -DELTA_V;
	} else if (key == KEY_space) {	
		delta_wheel1_velocity = -my_robot.wheel1_velocity;
		delta_wheel2_velocity = -my_robot.wheel2_velocity;
	} 
	
	my_robot.update();
	my_robot.accelerate_wheels(delta_wheel1_velocity, delta_wheel2_velocity); 
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

function keydown_ackerman_crab(event, my_robot)
{
	var key = event.which;
	
	var delta_velocity = 0, delta_steering_angle = 0;
	
	if (key == KEY_w) {
		delta_velocity = DELTA_V;
	} else if (key == KEY_s) {
		delta_velocity = -DELTA_V;
	} else if (key == KEY_a) {
		delta_steering_angle = -DELTA_ALPHA;
	} else if (key == KEY_d) {
		delta_steering_angle = DELTA_ALPHA;
	} else if (key == KEY_space) {
		delta_velocity = -my_robot.velocity;
	} else {
		return;
	}
	
	my_robot.update();
	my_robot.accelerate(delta_velocity);
	my_robot.steer(delta_steering_angle);
}

function paintCanvas() 
{
	for(index = 0; index < robots.length; index++) {
		var canvas = document.getElementById("canvas"+index);
		var context = canvas.getContext("2d");
		
		context.fillStyle = "lightGray";
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		robots[index].update();
		robots[index].draw(context);
	}
}