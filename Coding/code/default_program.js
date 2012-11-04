var MAX_DIST = 500,
    MAX_SPEED = .1,
    SETPOINT = 100;

// called when "run" is pressed
function program_init(robot) 
{
    robot.dist_sensor.set_offset_angle(PI/5);
    robot.set_wheel_velocities(0, 0);
}

// called every 100 ms after "run" is pressed
function program_loop(robot)
{
    var dist = robot.dist_sensor.read().distance,
        error = dist - SETPOINT;

    var vel_left = MAX_SPEED,
        vel_right = MAX_SPEED;

    if (error > 0) 
    {
        var error_norm = 1 - error/(MAX_DIST - SETPOINT);
        vel_right = MAX_SPEED*(2*error_norm - 1);
    } 
    else if (error < 0) 
    {
        var error_norm = 1 + error/SETPOINT;
        vel_left = MAX_SPEED*(2*error_norm - 1);
    } 

    robot.set_wheel_velocities(vel_right, vel_left);
}


