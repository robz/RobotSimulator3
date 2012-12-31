function particle_filter(obstacles, dist_sensor, numParticles, startx, starty, rangex, rangey, rangedir) 
{
    this.obstacles = obstacles;
    this.dist_sensor = dist_sensor;
    this.numParticles = numParticles;
    this.particles = new Array(numParticles);
    this.best_guess = create_particle(startx+rangex/2, starty+rangey/2, 0);
    this.verbosity_level = 1;
    
    for (var i = 0; i < numParticles; i++) {
        this.particles[i] = create_particle(
                                startx + Math.random()*rangex, 
                                starty + Math.random()*rangey, 
                                Math.random()*rangedir
                                );
    }
    
    this.drawParticles = function(context) {
        if (this.verbosity_level == 2) {
            return;
        }
    
        if (this.verbosity_level == 1) {
            for (var i = 0; i < numParticles; i++) {
                this.particles[i].draw(context);
            }
            return;
        }
        
        this.best_guess.draw(context);
    };
    
    this.iterate = function(dist, dir) {
	    this.assignWeights(dist, dir, this.particles, this.obstacles);
	    this.particles = this.resample(this.particles);
	    this.transition(this.particles, this.obstacles);
	    this.best_guess = this.getBestGuess(this.particles);
    };
    
    this.getBestGuess = function(list) {
        var totalx = 0, totaly = 0, totaldirx = 0, totaldiry = 0;
        
        for (var i = 0; i < list.length; i++) {
            totalx += list[i].x;
            totaly += list[i].y;
            totaldirx += Math.cos(list[i].dir);
            totaldiry += Math.sin(list[i].dir);
        }
        
        return create_particle(
                   totalx/list.length,
                   totaly/list.length,
                   my_atan(totaldiry, totaldirx)
                   );
    }
    
    this.resample = function (list) {
	    var newList = new Array(list.length);
	    
	    for(var i = 0; i < list.length; i++) {
		    var rand = Math.random(),
		        index = 0, 
		        runningSum = 0;
		    
		    for(var j = 0; j < list.length; j++) {
			    runningSum += list[j].weight;
			    if (rand < runningSum) {
				    index = j;
				    break;
			    }
		    }
		    
		    newList[i] = list[index];
	    }
	    
	    return newList;
    };

    this.assignWeights = function(dist, dir, list, obstacles) {
	    var total = 0;
	
	    for(var i = 0; i < list.length; i++) {
		    var p = list[i];
		    var actual_dist = this.dist_sensor.getVal(
			                    p.x, 
						        p.y, 
						        p.dir + dir, 
						        obstacles,
						        p.MAX_RANGE
						        );
						     
		    list[i].weight = this.weightFunct(Math.abs(actual_dist - dist));
		    total += list[i].weight;
	    }
	
	    // normalize
	    for(var i = 0; i < list.length; i++) {
		    list[i].weight = list[i].weight/total;
	    }
    };

    this.transition = function(list, obstacles) {
	    for(var i = 0; i < list.length; i++) {
		    var newParticle;
		
		    do {
		        var oldParticle = list[i];
			    newParticle = create_particle(
						        oldParticle.x + Math.random()*40-20,
						        oldParticle.y + Math.random()*40-20,
						        oldParticle.dir + Math.random()*Math.PI/3-Math.PI/6
	                            );
		    } while (!this.particleIsValid(newParticle, obstacles));
		
		    list[i] = newParticle;
	    }
    };
    
    this.weightFunct = function(val) {
	    return 1/(val+1);
    }

    this.particleIsValid = function(particle, obstacles) {
	    if(!(particle.x > 0 && particle.x < CANVAS_WIDTH 
	      && particle.y > 0 && particle.y < CANVAS_HEIGHT)) {
		    return false;
        }
        return true;
    }
}

function create_particle(x, y, dir) {
    return {
        RADIUS: 3,
        MAGNITUDE: 10,
        MAX_RANGE: 500,
        x: x,
        y: y,
        dir: dir,
        
        draw: function(context) {
            context.beginPath();
            context.arc(this.x, this.y, this.RADIUS, 0, Math.PI*2, false);
            context.fill();
            
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.MAGNITUDE*Math.cos(this.dir), 
                           this.y + this.MAGNITUDE*Math.sin(this.dir));
            context.stroke();
        }
    };
}
