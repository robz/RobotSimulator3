var MAX_DIST = 7,
    MAX_SPEED = .1,
    SETPOINT = 3.5;

// called when "run" is pressed
function program_init(robot) 
{
    robot.set_wheel_velocities(0, 0);
}

// called every 100 ms after "run" is pressed
function program_loop(robot)
{
    var line_sensor_vals = robot.line_sensor.read();
    var sum = 0, total = 0;
    for (var i = 0; i < line_sensor_vals.length; i++) {
        if (line_sensor_vals[i]) {
            sum += i;
            total++;
        }
    }
    
    var error = SETPOINT - sum/total;

    var vel_left = MAX_SPEED,
        vel_right = MAX_SPEED;

    if (error > 0) 
    {
        var error_norm = 1 - error/(MAX_DIST-SETPOINT);
        vel_left = MAX_SPEED*error_norm;
    } 
    else if (error < 0) 
    {
        var error_norm = 1 + error/SETPOINT;
        vel_right = MAX_SPEED*error_norm;
    } 

    robot.set_wheel_velocities(vel_right, vel_left);
}
