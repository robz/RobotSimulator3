var RAYTRACER_COLS = 30, RAYTRACER_ROWS = 30, 

	DELTA_V = .05, MAX_V = .1, 
	
	SCALE = .5, WHEEL_WIDTH = 4*SCALE, WHEEL_LENGTH = 15*SCALE,

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
        robot.length/2,
        0,
        100,
        0,
        -Math.PI/2,
        Math.PI/2,
        100
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
	setInterval(function () { lineFollower.takeAction(); }, 30);
	setInterval(paintCanvas, 30);
};

function create_obstacles() {
    var r, d, i, seedx, seedy, a1, a2, a3;

	obstacles = [];
  
    r = 100;
    d = 100;
    
    for (i = 0; i < 10; i++) {
        seedx = Math.random()*(canvas.width - 2*d) + d;
        seedy = Math.random()*(canvas.height - 2*d) + d;
        a1 = Math.random()*Math.PI*2/3;
        a2 = Math.random()*Math.PI*2/3;
        a3 = Math.random()*Math.PI*2/3;
        
        obstacles.push(obstacle(create_polygon([
            create_point(seedx + r*Math.cos(a1), seedy + r*Math.sin(a1)),
            create_point(seedx + r*Math.cos(a1+a2), seedy + r*Math.sin(a1+a2)),
            create_point(seedx + r*Math.cos(a1+a2+a3), seedy + r*Math.sin(a1+a2+a3)),
        ])));
    }
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
