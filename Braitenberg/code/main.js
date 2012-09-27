var PI = Math.PI, MAX_V = .5, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var FEAR = 0, AGGRESSION = 1, LOVE = 2, EXPLORE = 3;
var braitenberg_colors = [
        "black",
        "red",
        "blue",
        "green"
    ];
var NUM_ROBOTS = 50, NUM_SOURCES = 4, SOURCE_VAR = 70;

var robots, timekeeper, mouse;

window.onload = function() 
{
    var canvas = document.getElementById("canvas");
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;

    width = 40*SCALE;
    length = 40*SCALE;
    
    timekeeper = gametime_timekeeper();
    timekeeper.init();
    
    mouse = {x: CANVAS_WIDTH/2, y: CANVAS_HEIGHT/2};
    
    sources = [];
    for(var i = 0; i < NUM_SOURCES-1; i++) {
        sources.push({
            variance : SOURCE_VAR,
            x : Math.random()*(CANVAS_WIDTH-SOURCE_VAR)+.5*SOURCE_VAR,
            y : Math.random()*(CANVAS_HEIGHT-SOURCE_VAR)+.5*SOURCE_VAR
        });
    }
    
    sources.push({
            variance : SOURCE_VAR,
            x : mouse.x,
            y : mouse.y
        });
    
    var flag = false;
    robots = new Array(NUM_ROBOTS);
    for (var i = 0; i < NUM_ROBOTS; i++) {
        startx = Math.random()*(CANVAS_WIDTH-200)+100;
        starty = Math.random()*(CANVAS_HEIGHT-200)+100;
        startdir = Math.random()*2*PI;
        robots[i] = tank_robot(startx, starty, startdir, 0, 0, width, length, 0, timekeeper);
        
        var sources_temp = sources;
        
        robots[i].braitenberg_type = Math.round(i*4/NUM_ROBOTS - .5);
        
        if (!flag && robots[i].braitenberg_type == EXPLORE) {
            robots[i].source_marked = true;
            
            var new_sources = [];
            for (var j = 1; j < sources.length; j++) {
                new_sources.push(sources[j]);
            }
            sources_temp = new_sources;
            
            flag = true;
            
        }
        
        var lightsensor1 = light_sensor(sources_temp,
            robots[i], my_atan(robots[i].width/2, robots[i].length), 
            Math.sqrt(robots[i].width*robots[i].width + robots[i].length*robots[i].length/4));

        var lightsensor2 = light_sensor(sources_temp,
            robots[i], my_atan(-robots[i].width/2, robots[i].length), 
            Math.sqrt(robots[i].width*robots[i].width + robots[i].length*robots[i].length/4));
        
        robots[i].sensors.push(lightsensor1);
        robots[i].sensors.push(lightsensor2);
    }

    setInterval("timekeeper.update(10);", 10);
    setInterval(paintCanvas, 30);
    setInterval(robot_loops, 100);
}

function mouseMoved(event) {
    if(event.offsetX) {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
    }
    else if(event.layerX) {
        mouse.x = event.layerX-canvas.offsetLeft;
        mouse.y = event.layerY-canvas.offsetTop;
    }
    sources[NUM_SOURCES-1].x = mouse.x;
    sources[NUM_SOURCES-1].y = mouse.y;
}

function robot_loops() {
    for (var i = 0; i < robots.length; i++) {
        program_loop(robots[i]);
    }
}

function program_loop(robot) {
    var sense1 = robot.sensors[0].val,
        sense2 = robot.sensors[1].val;
    
    if (robot.braitenberg_type == FEAR) {
        robot.wheel1_velocity = sense1;
        robot.wheel2_velocity = sense2;
    } else if (robot.braitenberg_type == AGGRESSION) {
        robot.wheel1_velocity = sense2;
        robot.wheel2_velocity = sense1;
    } else if (robot.braitenberg_type == LOVE) {
        robot.wheel1_velocity = 1 - sense1;
        robot.wheel2_velocity = 1 - sense2;
    } else if (robot.braitenberg_type == EXPLORE) {
        robot.wheel1_velocity = 1 - sense2;
        robot.wheel2_velocity = 1 - sense1;
    } 
    
    if (robot.source_marked) {
        robot.wheel1_velocity *= MAX_V/2;
        robot.wheel2_velocity *= MAX_V/2;
    } else {
        robot.wheel1_velocity *= MAX_V;
        robot.wheel2_velocity *= MAX_V;
    }
}

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "orange";
    for (var i = 0; i < robots[0].sensors.length; i++) {
        robots[0].sensors[i].drawSources(context);
    }
    
    for (var j = 0; j < robots.length; j++) {
        context.strokeStyle = braitenberg_colors[robots[j].braitenberg_type];
        robots[j].update();
        
        // loop around
        
        if (robots[j].x < -CANVAS_WIDTH/2) {
            robots[j].x += CANVAS_WIDTH+CANVAS_WIDTH/2+CANVAS_WIDTH/4;
        } else if (robots[j].x > CANVAS_WIDTH+CANVAS_WIDTH/2) {
            robots[j].x -= (CANVAS_WIDTH+CANVAS_WIDTH/2+CANVAS_WIDTH/4);
        }
        
        if (robots[j].y < -CANVAS_HEIGHT/2) {
            robots[j].y += CANVAS_HEIGHT+CANVAS_HEIGHT/2+CANVAS_HEIGHT/4;
        } else if (robots[j].y > CANVAS_HEIGHT+CANVAS_HEIGHT/2) {
            robots[j].y -= (CANVAS_HEIGHT+CANVAS_HEIGHT/2+CANVAS_HEIGHT/4);
        }
        
        robots[j].draw(context, false);
    
        if (robots[j].source_marked) {
            console.log("hi!");
            sources[0].x = robots[j].x;
            sources[0].y = robots[j].y;
        }
    }
}
