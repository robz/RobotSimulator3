var XCELLS = 100, YCELLS = 100; 
var CANVAS_WIDTH, CANVAS_HEIGHT, CELL_WIDTH, CELL_HEIGHT;
var bounding_grid;

var WALL_DIFFS = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1]
];

var startp, obstacles;
 
window.onload=function() {  
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    
    CANVAS_WIDTH = canvas.width;
    CANVAS_HEIGHT = canvas.height;
    CELL_WIDTH = CANVAS_WIDTH/XCELLS;
    CELL_HEIGHT = CANVAS_HEIGHT/YCELLS;

    bounding_grid = createBoundingGrid(XCELLS, YCELLS, CELL_WIDTH, CELL_HEIGHT);
  
    obstacles = [];
    var r = 100, d = 400;
    context.strokeStyle = "black";
    for (var i = 0; i < 1000; i++) {
        var seedx = Math.random()*(CANVAS_WIDTH-2*d)+d,
            seedy = Math.random()*(CANVAS_HEIGHT-2*d)+d,
            a1 = Math.random()*Math.PI*2/3,
            a2 = Math.random()*Math.PI*2/3,
            a3 = Math.random()*Math.PI*2/3;
        obstacles.push(obstacle(create_polygon([
            create_point(seedx + r*Math.cos(a1), seedy + r*Math.sin(a1)),
            create_point(seedx + r*Math.cos(a1+a2), seedy + r*Math.sin(a1+a2)),
            create_point(seedx + r*Math.cos(a1+a2+a3), seedy + r*Math.sin(a1+a2+a3)),
        ])));
        obstacles[i].draw(context);
    }

    context.strokeStyle = "lightGray";
    
    fillGrid(bounding_grid.grid, obstacles);
}

function mouseclicked(event) {
    startp = {x: event.offsetX, y: event.offsetY};
    var context = document.getElementById("canvas").getContext("2d");
    var totalrays = 360;
    for (var i = 0; i < totalrays; i++) { 
        var ray = createRay(startp.x, startp.y, 2*Math.PI*i/totalrays, 20);    

        ray.draw(context);    

        var dist = getDistance(ray);

        context.beginPath();
        context.moveTo(startp.x, startp.y);
        context.lineTo(startp.x + dist*Math.cos(ray.dir),
                   startp.y + dist*Math.sin(ray.dir));
        context.stroke();
    }
}
/*
function mousemoved(event) {
    var ray = createRay(startp.x, startp.y, 
                        my_atan(event.offsetY - startp.y, event.offsetX - startp.x),
                        20);
    
    var context = document.getElementById("canvas").getContext("2d");    

    ray.draw(context);    

    var dist = getDistanceOld(ray);

    context.beginPath();
    context.moveTo(startp.x, startp.y);
    context.lineTo(startp.x + dist*Math.cos(ray.dir),
                   startp.y + dist*Math.sin(ray.dir));
    context.stroke();
}
*/
function getDistanceOld(ray) {
    var mindist = 1000;
    for (var i = 0; i < obstacles.length; i++) {
        var poly = obstacles[i].polygon;
        for (var j = 0; j < poly.lines.length; j++) {
            var p = lineSegmentIntersection(ray.line, poly.lines[j]);
            if (p) {
                var newdist = euclidDist(p, ray);
                if (newdist < mindist) {
                    mindist = newdist;
                }
            }
        }
    }
    return mindist;
}

function getDistance(ray) {
    var cell = bounding_grid.getCell(ray);
    var maxdist = 1000, pdist = {dist:0}, totaldist = 0, dist = maxdist;   
 
    while (cell != null) { 
        totaldist += pdist.dist;
        for (var i = 0; i < cell.obstacles.length; i++) {
            var poly = cell.obstacles[i].polygon;
            for (var j = 0; j < poly.lines.length; j++) {
                var p = lineSegmentIntersection(ray.line, poly.lines[j])
                if (p) {
                    var newdist = euclidDist(p, startp) 
                    if (newdist < dist) {
                        dist = newdist;
                    }
                }
            }
        }
        cell = traceToNextBoundary(ray, cell, maxdist-totaldist, pdist);
    } 
    
    return dist;
}

function fillGrid(grid, obstacles) {
    for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
            var box = grid[x][y].box;
            for (var i = 0; i < obstacles.length; i++) {
                if (polyIntersectsPoly(box, obstacles[i].polygon)) {
                    grid[x][y].obstacles.push(obstacles[i]);
                } 
            }
        }
    }
}

function traceToNextBoundary(ray, cell, mindist, pdist, context) {
    var intersection = null,
        intersectionIndex = -1;
    
    for (var i = 0; i < cell.lines.length; i++) {
        var p = lineSegmentIntersection(cell.lines[i], ray.line);

        if (p) {
            var dist = euclidDist(p, ray);
            if (dist > 0.001 && dist < mindist) {
                mindist = dist;
                intersection = p;
                intersectionIndex = i;
            }
        }
    }
   
    if (intersection) {
        ray.reinit(intersection);
        var cell = bounding_grid.getNextCell(cell, intersectionIndex);
 
        if (cell) {
            pdist.dist = mindist;
            return cell;
        } else {
            return null;
        }
    } else {
        return undefined;
    }
}

function createRay(x, y, dir, m) {
    return {
        x: x,
        y: y,
        dir: dir,
        m: m,
        line: create_line_from_vector({x:x,y:y}, dir, CANVAS_WIDTH*CANVAS_HEIGHT),
        
        reinit: function(p) {
            this.x = p.x;
            this.y = p.y;
            this.line = create_line_from_vector(p, dir, CANVAS_WIDTH*CANVAS_HEIGHT);
        },

        draw: function(context) {
            var tipx = this.x + this.m*Math.cos(this.dir),
                tipy = this.y + this.m*Math.sin(this.dir);
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(tipx, tipy);
            context.lineTo(tipx + (m/4)*Math.cos(this.dir+Math.PI*3/4), 
                           tipy + (m/4)*Math.sin(this.dir+Math.PI*3/4));
            context.lineTo(tipx, tipy);
            context.lineTo(tipx + (m/4)*Math.cos(this.dir-Math.PI*3/4), 
                           tipy + (m/4)*Math.sin(this.dir-Math.PI*3/4));
            context.stroke();
        }
    };
}

function createBoundingGrid(xcells, ycells, sizex, sizey) {
    var xlines = new Array(xcells+1),
        ylines = new Array(ycells+1);

    for (var x = 0; x <= xcells; x++) {
        xlines[x] = create_line({x:x*sizex, y:0}, {x:x*sizex, y:ycells*sizey}); 
    }

    for (var y = 0; y <= ycells; y++) {
        ylines[y] = create_line({x:0, y:y*sizey}, {x:xcells*sizex, y:y*sizey});
    }

    var grid = new Array(xcells);
    for (var x = 0; x < xcells; x++) {
        grid[x] = new Array(ycells);
        for (var y = 0; y < ycells; y++) {
            grid[x][y] = {
                x: x, 
                y: y, 
                lines: [xlines[x], ylines[y], xlines[x+1], ylines[y+1]],
                box: create_boxpoly(x*sizex, y*sizey, sizex, sizey),
                obstacles: [] 
            };
        }
    }
    
    return {
        grid: grid,

        getCell: function(point) {
            var borderx = Math.round((point.x - sizex/2)/sizex),
                bordery = Math.round((point.y - sizey/2)/sizey);
            return this.grid[borderx][bordery];
        },

        getNextCell: function(cell, wallIndex) {
            var diffs = WALL_DIFFS[wallIndex];
            var newx = cell.x + diffs[0],
                newy = cell.y + diffs[1];    
            if (newx < 0 || newx >= xcells || newy < 0 || newy >= ycells) {
                return null;
            }
            return this.grid[newx][newy];
        },

        draw: function(context) {
            for (var x = 0; x < this.grid.length; x++) {
                for (var y = 0; y < this.grid[x].length; y++) {
                    if (this.grid[x][y].obstacles.length == 0) {
                        context.strokeRect(x*sizex, y*sizey, sizex, sizey);
                    } else {
                        // context.fillRect(x*sizex, y*sizey, sizex, sizey);
                    }
                    context.fillText(this.grid[x][y].obstacles.length, x*sizex+sizex/2, y*sizey+sizey/2);
                }
            }
        }
    };
}

