var RAYTRACER_COLS = 20, RAYTRACER_ROWS = 20, 
	DELTA_V = .05, MAX_V = .1, 
	SCALE = .5, WHEEL_WIDTH = 4*SCALE, WHEEL_LENGTH = 15*SCALE,
	NUM_OBSTACLES = 10,
    canvas, context,
    lineFollower, controller, robot;

window.onload = function() 
{
    var time_keeper, my_lidar_sensor;

	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	create_obstacles();
    
    raytracer = new Raytracer(
        RAYTRACER_COLS, 
        RAYTRACER_ROWS, 
        canvas.width/RAYTRACER_COLS, 
        canvas.height/RAYTRACER_ROWS, 
        obstacles
    );
	
    time_keeper = gametime_timekeeper();
	time_keeper.init();
	
	robot = tank_robot(
	    canvas.width/2, 
	    canvas.height/2, 
		Math.PI, 
		0, 
		0, 
		40*SCALE, 
		40*SCALE, 
		0, 
		time_keeper
    );
    
    my_lidar_sensor = lidar_sensor(
        raytracer,
        robot,
        0,
        robot.length, // length placement
        0,
        80, // distance
        0,
        -Math.PI/2,
        Math.PI/2,
		50 // num rays
    );  
    	
    robot.sensors = [
        my_lidar_sensor
    ];
    
    lineFollower = create_lineFollower(
        robot
    );
    
    controller = create_controller(
        robot,
        my_lidar_sensor,
        lineFollower
    );
	
	setInterval(function () { time_keeper.update(10); }, 10);
	setInterval(function () { controller.makeDecision(); }, 30);
	setInterval(paintCanvas, 30);
};

function create_obstacles() {
    var r, d, num_sides, vertexes, i, j, seedx, seedy, angle;

	obstacles = [];
  
    r = 40;
    d = 100;
	num_sides = 15;
    
    for (i = 0; i < NUM_OBSTACLES; i++) {
        seedx = Math.random()*(canvas.width - 2*d) + d;
        seedy = Math.random()*(canvas.height - 2*d) + d;
		
		vertexes = [];
		
		angle = 0;
		for (j = 0; j < num_sides; j++) {
			angle += Math.PI*2/num_sides;
			vertexes.push(create_point(seedx + r*Math.cos(angle), 
									   seedy + r*Math.sin(angle)));
		}
        
        obstacles.push(obstacle(create_polygon(vertexes)));
    }
	
	obstacles.push(obstacle(create_polygon([
		create_point(0, 0),
        create_point(canvas.width, 0),
        create_point(canvas.width, 10),
        create_point(0, 10)
    ])));
	obstacles.push(obstacle(create_polygon([
		create_point(0, 0),
        create_point(10, 0),
        create_point(10, canvas.height),
        create_point(0, canvas.height)
    ])));
	obstacles.push(obstacle(create_polygon([
		create_point(0, canvas.height-10),
        create_point(0, canvas.height),
        create_point(canvas.width, canvas.height),
        create_point(canvas.width, canvas.height-10)
    ])));
	obstacles.push(obstacle(create_polygon([
		create_point(canvas.width - 10, 0),
        create_point(canvas.width, 0),
        create_point(canvas.width, canvas.height),
        create_point(canvas.width - 10, canvas.height)
    ])));
}

function clicked(event) {
	var mouseX, mouseY, clicked_pos;

    if (event.offsetX) {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
    } else if (event.layerX) {
        mouseX = event.layerX - canvas.offsetLeft;
        mouseY = event.layerY - canvas.offsetTop;
    } else {
        console.log("bro, what click just happened?");
        return;
    }

	clicked_pos = create_point(mouseX, mouseY);
	controller.setGoal(clicked_pos);
}	

function paintCanvas() {
    var i;
    
    context.save();
    
    context.fillStyle = "lightGray";	    
    context.fillRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = "tan";
    context.lineWidth = 3;
    for (i = 0; i < obstacles.length; i++) {
        obstacles[i].draw(context);
    }
	
	if (lineFollower.line) {
	    context.lineWidth = 2;
        context.strokeStyle = "purple";
		context.moveTo(line.p1.x, line.p1.y);
		context.lineTo(line.p2.x, line.p2.y);
        context.stroke();
	}
	
	if (controller.getGoal()) {
		context.fillStyle = "red";
		context.beginPath();
		context.arc(controller.getGoal().x, controller.getGoal().y, 5, 0, Math.PI*2, false);
		context.fill();
	}
	
	robot.update();
	
	context.strokeStyle = "green";
	robot.draw(context);
	
	context.lineWidth = 1;
    context.strokeStyle = "black";
    context.fillStyle = "black";
    for (i = 0; i < robot.sensors.length; i++) { 
        robot.sensors[i].draw(context);
    }
    
    controller.draw(context);
    
    context.restore();
}
