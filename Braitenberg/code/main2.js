var PI = Math.PI, MAX_V = .5, DELTA_ALPHA = PI/20, DELTA_V = .005, CANVAS_WIDTH, CANVAS_HEIGHT, 
    KEY_w = 87, KEY_s = 83, KEY_a = 65, KEY_d = 68, KEY_space = 32, KEY_e = 69;

var NUM_ROBOTS = 20, NUM_SOURCES = 1+NUM_ROBOTS, SOURCE_VAR = 60, 
    NUM_EXPLORER_SOURCES = NUM_ROBOTS;//NUM_SOURCES-1;
var FEAR = 0, HATE = 1, LOVE = 2, EXPLORE = 3;
var braitenberg_colors = [
        "black",
        "red",
        "blue",
        "green"
    ];

var robots, timekeeper, mouse, sources;

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
    for (var i = 0; i < NUM_SOURCES; i++) {
        sources.push({
            variance : SOURCE_VAR,
            x : CANVAS_WIDTH/2, 
            y: CANVAS_HEIGHT/2
        });
    }
    
    for (var y = 0; y <= CANVAS_HEIGHT; y += CANVAS_HEIGHT) {
        for (var x = 0; x <= CANVAS_WIDTH; x += CANVAS_WIDTH/10) {
            sources.push({ variance : SOURCE_VAR, x : x, y: y });
        }
    }
    
    for (var x = 0; x <= CANVAS_WIDTH; x += CANVAS_WIDTH) {
        for (var y = 0; y <= CANVAS_HEIGHT; y += CANVAS_HEIGHT/5) {
            sources.push({ variance : SOURCE_VAR, x : x, y: y });
        }
    }
    
    robots = new Array(NUM_ROBOTS);
    for (var i = 0; i < NUM_ROBOTS; i++) {
        startx = Math.random()*(CANVAS_WIDTH-200)+100;
        starty = Math.random()*(CANVAS_HEIGHT-200)+100;
        startdir = Math.random()*2*PI;
        robots[i] = tank_robot(startx, starty, startdir, 0, 0, width, length, 0, timekeeper);
        
        var robot_sources = sources;
        
        robots[i].braitenberg_type = EXPLORE;
        
        if (NUM_EXPLORER_SOURCES > 0 && robots[i].braitenberg_type == EXPLORE) {
            robots[i].source_marked = true;
            
            // duplicate sources list but without the source attached to this robot
            var new_sources = [];
            for (var j = 0; j < sources.length; j++) {
                if (j != i) {
                    new_sources.push(sources[j]);
                }
            }
            robot_sources = new_sources;
            
            NUM_EXPLORER_SOURCES--;
        }
        
        var lightsensor1 = light_sensor(robot_sources,
            robots[i], my_atan(robots[i].width/2, robots[i].length), 
            Math.sqrt(robots[i].width*robots[i].width + robots[i].length*robots[i].length/4));

        var lightsensor2 = light_sensor(robot_sources,
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
    if (!mouse) {
        return;
    }

    if (event.offsetX !== undefined) {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
    } else if (event.layerX !== undefined) {
        mouse.x = event.layerX - canvas.offsetLeft;
        mouse.y = event.layerY - canvas.offsetTop;
    } else {
        console.error("can't read mouse values!");
        return;
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
    } else if (robot.braitenberg_type == HATE) {
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

function drawSources(context, sources) {
    for (var i = 0; i < sources.length; i++) {
        context.beginPath();
        context.arc(sources[i].x, sources[i].y,
                    sources[i].variance/5, 0, 2*PI, false);
        context.fill();
    }
}

function paintCanvas() 
{
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
        
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = "orange";
    drawSources(context, sources);
    
    for (var j = 0; j < robots.length; j++) {
        context.strokeStyle = braitenberg_colors[robots[j].braitenberg_type];
        robots[j].update();
        
        // loop around
        
        if (robots[j].x < 0) {
            robots[j].x += CANVAS_WIDTH;
        } else if (robots[j].x > CANVAS_WIDTH) {
            robots[j].x -= CANVAS_WIDTH;
        }
        
        if (robots[j].y < 0) {
            robots[j].y += CANVAS_HEIGHT;
        } else if (robots[j].y > CANVAS_HEIGHT) {
            robots[j].y -= CANVAS_HEIGHT;
        }
        
        robots[j].draw(context, false);
    
        if (robots[j].source_marked) {
            sources[j].x = robots[j].x+robots[j].length*Math.cos(robots[j].heading)/2;
            sources[j].y = robots[j].y+robots[j].length*Math.sin(robots[j].heading)/2;
        }
    }
}
