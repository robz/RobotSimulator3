function euclidDist(p1, p2) {
    var d1 = p1.x - p2.x,
        d2 = p1.y - p2.y;
    return Math.sqrt(d1*d1 + d2*d2);
}

function polyIntersectsCircle(poly, circle) {
    // check if polygon's lines intersect circle boundary
    for (var i = 0; i < poly.lines.length; i++) {
        var p = dirLineSegCircleIntersection(poly.lines[i], circle);
        if (p) {
            return p;
        }
    }
    return false;
}

// returns intersection of *directed* line segment and circle
//    if one exists, false otherwise
function dirLineSegCircleIntersection(line, circle) {
    var perpline = create_line_from_vector(circle.c, line.theta+Math.PI/2, 999999);
    var p = lineIntersection(line, perpline);
    var d = euclidDist(p, circle.c);
    
    if (d <= circle.r) {
        var b = Math.sqrt(circle.r*circle.r - d*d);
        
        // check point forward on the line
        var p2 = create_point(p.x + b*Math.cos(line.theta),
                              p.y + b*Math.sin(line.theta));
        if (pointInBoxLine(p2, line)) {
            return p2;
        }
    } 
    
    return false;
}

function polyIntersectsPoly(poly1, poly2) {
    //check if lines intersect
    for (var i = 0; i < poly1.lines.length; i++) {
        for (var j = 0; j < poly2.lines.length; j++) {
            var intersection = lineSegmentIntersection(poly1.lines[i], poly2.lines[j]);
            if (intersection != false) {
                return intersection;
            }
        }
    }
    
    return false;
}

// where line defines the diagonal line segment inside a box 
//    which has two opposite points line.p1 and line.p2
function pointInBoxLine(point, line) {
    var p1 = create_rounded_point(line.p1.x, line.p1.y), 
        p2 = create_rounded_point(line.p2.x, line.p2.y),
        p = create_rounded_point(point.x, point.y);
    
    return ((p.y >= p1.y && p.y <= p2.y) 
        || (p.y <= p1.y && p.y >= p2.y))
        && ((p.x >= p1.x && p.x <= p2.x)
        || (p.x <= p1.x && p.x >= p2.x));
}

var t123_p = create_rounded_point(null, null),
	t123_p1 = create_rounded_point(null, null),
	t123_p2 = create_rounded_point(null, null);
	
// where line defines the diagonal line segment inside a box 
//    which has two opposite points line.p1 and line.p2
function inplace_pointInBoxLine(point, line) {
    inplace_create_rounded_point(point.x, point.y, t123_p);
    inplace_create_rounded_point(line.p1.x, line.p1.y, t123_p1); 
    inplace_create_rounded_point(line.p2.x, line.p2.y, t123_p2);
    
    return ((t123_p.y >= t123_p1.y && t123_p.y <= t123_p2.y) 
        || (t123_p.y <= t123_p1.y && t123_p.y >= t123_p2.y))
        && ((t123_p.x >= t123_p1.x && t123_p.x <= t123_p2.x)
        || (t123_p.x <= t123_p1.x && t123_p.x >= t123_p2.x));
}

// returns 
//    true if lines are parallel and segments overlap 
//    false if lines are parallel and segments don�t overlap
//        or lineIntersection is not on both segments
//    {x,y} if lineIntersection is on each given line segment
function lineSegmentIntersection(l1, l2) {
    var p = lineIntersection(l1, l2);
    
    if (p == false) {
        return false;
    }
    if (p == true) {
        return pointInBoxLine(l1.p1, l2) || pointInBoxLine(l1.p2, l2);
    }
    if (pointInBoxLine(p, l1) && pointInBoxLine(p, l2)) {
        return p;
    }
    
    return false;
}

// returns 
//    1 if lines are parallel and segments overlap 
//    2 if lines are parallel and segments don�t overlap
//        or lineIntersection is not on both segments
//    0 if lineIntersection is on each given line segment, & sets p
function inplace_lineSegmentIntersection(l1, l2, out_p) {
    var res = inplace_lineIntersection(l1, l2, out_p);
    
    if (res == 1) {
        return 1;
    }
	
    if (res == 2) {
        if (inplace_pointInBoxLine(l1.p1, l2) || inplace_pointInBoxLine(l1.p2, l2)) {
			return 1;
		} else {
			return 2;
		}
    }
	
    if (inplace_pointInBoxLine(out_p, l1) && inplace_pointInBoxLine(out_p, l2)) {
        return 0;
    }
    
    return 2;
}

// returns 
//    true if lines are parallel and overlap, 
//    false if they are parallel and don�t overlap, 
//    {x,y} otherwise
function lineIntersection (l1, l2) {
    if (l1.m == l2.m) {
        return l1.b == l2.b;
    }
    if (l1.isV) {
        return create_point(l1.b, l2.m*l1.b + l2.b);
    }
    if (l2.isV) {
        return create_point(l2.b, l1.m*l2.b + l1.b);
    }
    var x = (l2.b - l1.b)/(l1.m - l2.m);
    return create_point(x, l1.m*x + l1.b);
}

// returns 
//    1 if lines are parallel and overlap, 
//    2 if they are parallel and don�t overlap, 
//    0 otherwise, and sets p
function inplace_lineIntersection (l1, l2, out_p) {
    if (l1.m == l2.m) {
        if (l1.b == l2.b) {
			return 1;
		} else {
			return 2;
		}
    }
	
	var x, y;
	
    if (l1.isV) {
		x = l1.b;
		y = l2.m*x + l2.b;
    } else if (l2.isV) {
		x = l2.b;
		y = l1.m*x + l1.b;
    } else if (0 == l1.m) {
		y = l1.b;
		x = (y - l2.b)/l2.m;
	} else if (0 == l2.m) {
		y = l2.b;
		x = (y - l1.b)/l1.m;
	} else {
		x = (l2.b - l1.b)/(l1.m - l2.m);
		y = l1.m*x + l1.b;
	}
	
	out_p.x = x;
	out_p.y = y;
	
	return 0;
}

function create_circle(point, radius) {
    return {c:point, r:radius};
}

function create_boxpoly(startx, starty, width, height) {
    return create_polygon([
        create_point(startx, starty),
        create_point(startx+width, starty),
        create_point(startx+width, starty+height),
        create_point(startx, starty+height)
    ]);
}

// assumes points are in either clockwise or counter-clockwise order
// returns {points, lines}
function create_polygon(points) {
    var len = points.length;
    var lines = new Array(len);
    for(var i = 0; i < len-1; i++) {
        lines[i] = create_line(points[i], points[i+1]);
    }
    lines[len-1] = create_line(points[len-1], points[0]);

    return {
        points:points,
        lines:lines
    };
}

function create_lines(points) {
    var lines = new Array(points.length-1);
    for(var i = 0; i < points.length-1; i++) {
        lines[i] = create_line(points[i], points[i+1]);
    }
    return lines;
}

// returns {m, b, isV, p1, p2, theta}
function create_line(point1, point2) {
    var m = (point2.y - point1.y)/(point2.x - point1.x),
        isV�= point1.x == point2.x;
    var b = point1.y - m*point1.x;
    if (isV) {
        b = point1.x;
    } 
    return {
        m�: m,
        b�: b,
        isV�: isV,
        p1�: point1,
        p2�: point2,
        theta: my_atan(point2.y-point1.y, point2.x-point1.x),
    };
}

function inplace_create_line(point1, point2, out_line) {
    var m = (point2.y - point1.y)/(point2.x - point1.x),
        isV�= (point1.x == point2.x),
		b = point1.y - m*point1.x;
	
    if (isV) {
        b = point1.x;
    } 
	
    out_line.m�= m;
    out_line.b�= b;
    out_line.isV�= isV;
    out_line.p1�= point1;
    out_line.p2�= point2;
    out_line.theta = my_atan(point2.y - point1.y, point2.x - point1.x);
}

function create_line_from_vector(point, theta, mag, roundit) {
	if (roundit) {
		theta = Math.round(100000*theta)/100000; // HACK!!! also, happy new year!
	}
    
    var farpoint = create_point(
        point.x+mag*Math.cos(theta), 
        point.y+mag*Math.sin(theta));
    
    theta = (theta%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
    
    var ongrid = (theta/Math.PI*2)%2;
    if (ongrid == Math.round(ongrid)) {
        if (ongrid == 0 || ongrid == 2) {
            farpoint.y = point.y;
        } else if (ongrid == 1 || ongrid == 3) {
            farpoint.x = point.x;
        } 
	}
      
    return create_line(point, farpoint);
}

function inplace_create_line_from_vector(point, theta, mag, out_ray, roundit) {
    var farpoint = out_ray.p2;
    farpoint.x = point.x + mag*Math.cos(theta);
    farpoint.y = point.y + mag*Math.sin(theta);
	
	var ongrid = (theta/Math.PI*2)%2;
	
	if (roundit) {
		theta = Math.round(1000000*theta)/1000000; // HACK!!! also, happy new year!
		ongrid = Math.round(1000000*((theta/Math.PI*2)%2))/1000000;
	}
    
    if (ongrid == Math.round(ongrid)) {
        if (ongrid == 0 || ongrid == 2) {
            farpoint.y = point.y;
        } else if (ongrid == 1 || ongrid == 3) {
            farpoint.x = point.x;
        } 
	}
    
    inplace_create_line(point, farpoint, out_ray);
}

// returns {x, y} where both are rounded to 5 decimal points
function create_rounded_point(x, y) {
    return {x:Math.round(x*1000000)/1000000,
            y:Math.round(y*1000000)/1000000};
}

// sets out_p where x,y both are rounded to 5 decimal points
function inplace_create_rounded_point(x, y, out_p) {
    out_p.x = Math.round(x*1000000)/1000000;
    out_p.y = Math.round(y*1000000)/1000000;
}

// returns {x, y}
function create_point(x, y) {
    return {x:x, y:y};
}

function radToFramedRad(angle) {
	return (angle%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
}

function radToQuradian(angle) {
	return angle/Math.PI*2;
}

function my_atan(y, x) {
    if (x == 0) {
        if (y > 0) return Math.PI/2;
        else if (y < 0) return 3*Math.PI/2;
        else if (y == 0) return 0;
    }
    if (x < 0) 
        return Math.atan(y/x)+Math.PI;
    return (Math.atan(y/x)%(2*Math.PI) + 2*Math.PI)%(2*Math.PI);
}

