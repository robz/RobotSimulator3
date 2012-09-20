var count = 0;

// this function is called every 100 ms
function program_loop(robot)
{
    if (count < 20) {
        robot.wheel1_velocity = .1;
        robot.wheel2_velocity = .1;
    } else {
        robot.wheel1_velocity = .1;
        robot.wheel2_velocity = -.1;
    }
    
    count++;
    
    if (count > 25) {
        count = 0;
    }
}

