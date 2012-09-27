function light_sensor(sources, robot, angle, dist) {
    return {
        x : robot.x + dist*Math.cos(angle + robot.heading),
        y : robot.y + dist*Math.sin(angle + robot.heading),
        dist : dist,
        angle : angle,
        val: null,
        sources: sources,

        update : function(robot) {
            this.x = robot.x + dist*Math.cos(angle + robot.heading);
            this.y = robot.y + dist*Math.sin(angle + robot.heading);
            this.val = 0;
            for (var i = 0; i < sources.length; i++) {
                this.val += this.calcVal(sources[i], this.x, this.y);
            }
            this.val /= .9; // allow for saturation
            if (this.val > 1) this.val = 1;
        },

        calcVal : function(source, x, y) {
            var dx = source.x - x,
                dy = source.y - y;
            var dist = Math.sqrt(dx*dx + dy*dy),
                v = source.variance,
                norm = 1.0/(Math.sqrt(2*Math.PI)*v);
            
            return Math.exp(-(dist*dist)/(2*v*v))/(Math.sqrt(2*Math.PI)*v)/norm;
        },
        
        getVal : function() {
            return val;
        },

        drawSources : function(context) {
            for (var i = 0; i < this.sources.length; i++) {
                context.beginPath();
                context.arc(this.sources[i].x, this.sources[i].y,
                     this.sources[i].variance/5, 0, 2*PI, false);
                context.fill();
            }
        },

        draw : function(context) {
            var dispval = Math.round(this.val*1000)/1000;
            context.fillText(dispval, this.x, this.y);
        }
    }
}
