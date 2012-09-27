var PI = Math.PI, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var FEAR = 0, AGGRESSION = 1, LOVE = 2, EXPLORE = 3;
var NUM_ROBOTS = 100, NUM_SOURCES = 1;
var ROBOT_TYPE = FEAR;

var robots, timekeeper;

window.onload = function() 
{
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;

    width = 20*SCALE;
    length = 20*SCALE;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();

    var v = 100;
    var sources = [];
    for(var i = 0; i < NUM_SOURCES; i++) {
        sources.push({
            variance : v,
            x : Math.random()*(CANVAS_WIDTH-v)+.5*v,
            y : Math.random()*(CANVAS_HEIGHT-v)+.5*v
        });
    }
    
    robots = new Array(NUM_ROBOTS);
    for (var i = 0; i < NUM_ROBOTS; i++) {
        startx = Math.random()*(CANVAS_WIDTH-200)+100;
        starty = Math.random()*(CANVAS_HEIGHT-200)+100;
        startdir = Math.random()*2*PI;
        robots[i] = tank_robot(startx, starty, startdir, 0, 0, width, length, 0, timekeeper);
        
        var lightsensor1 = light_sensor(sources,
            robots[i], my_atan(robots[i].width/2, robots[i].length), 
            Math.sqrt(robots[i].width*robots[i].width + robots[i].length*robots[i].length/4));

        var lightsensor2 = light_sensor(sources,
            robots[i], my_atan(-robots[i].width/2, robots[i].length), 
            Math.sqrt(robots[i].width*robots[i].width + robots[i].length*robots[i].length/4));
        
        robots[i].sensors.push(lightsensor1);
        robots[i].sensors.push(lightsensor2);
    }

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
    setInterval(robot_loops, 100);
}

function robot_loops() {
    for (var i = 0; i < robots.length; i++) {
        program_loop(robots[i]);
    }
}

function program_loop(robot) {
    var sense1 = robot.sensors[0].val,
        sense2 = robot.sensors[1].val;
    
    if (ROBOT_TYPE == FEAR) {
        robot.wheel1_velocity = sense1;
        robot.wheel2_velocity = sense2;
    } else if (ROBOT_TYPE == AGGRESSION) {
        robot.wheel1_velocity = sense2;
        robot.wheel2_velocity = sense1;
    } else if (ROBOT_TYPE == LOVE) {
        robot.wheel1_velocity = 1 - sense1;
        robot.wheel2_velocity = 1 - sense2;
    } else if (ROBOT_TYPE == EXPLORE) {
        robot.wheel1_velocity = 1 - sense2;
        robot.wheel2_velocity = 1 - sense1;
    } 

    robot.wheel1_veloctiy *= (MAX_V/2);
    robot.wheel1_veloctiy *= (MAX_V/2);
}

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    for (var j = 0; j < robots.length; j++) {
        robots[j].update();
        robots[j].draw(context);
    
        for (var i = 0; i < robots[j].sensors.length; i++) {
            robots[j].sensors[i].draw(context);
        }
    }

    // console.log(lightsensor.val);
}
