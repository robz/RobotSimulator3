var NUM_TRIANGLES = 100, NUM_RAYS = 1000, ROWS = 20, COLS = 30;

var raytracer, context, canvas, obstacles;

window.onload = function() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    obstacles = [];
	
    var r = 30, d = 100;
    for (var i = 0; i < NUM_TRIANGLES; i++) {
        var seedx = Math.random()*(canvas.width-2*d)+d,
            seedy = Math.random()*(canvas.height-2*d)+d,
            a1 = Math.random()*Math.PI*2/3,
            a2 = Math.random()*Math.PI*2/3,
            a3 = Math.random()*Math.PI*2/3;
	
        obstacles.push(obstacle(create_polygon([
            create_point(seedx + r*Math.cos(a1), seedy + r*Math.sin(a1)),
            create_point(seedx + r*Math.cos(a1+a2), seedy + r*Math.sin(a1+a2)),
            create_point(seedx + r*Math.cos(a1+a2+a3), seedy + r*Math.sin(a1+a2+a3)),
        ])));
    }
    
    raytracer = new Raytracer(COLS, ROWS, canvas.width/COLS, canvas.height/ROWS, obstacles);
    
    drawStuff(create_point(canvas.width/2, canvas.height/2));
}

function mousemove(event) {
    var mouse = null;
    
    if (event.offsetX) {
        mouse = create_point(event.offsetX, event.offsetY);
    } else if (event.layerX) {
        mouse = create_point(event.layerX - canvas.offsetLeft,
                             event.layerY - canvas.offsetTop);
    } else {
        return;
    }
    
	drawStuff(mouse);
}

function drawStuff(start) {
    context.fillStyle = "lightGray";
    context.fillRect(0, 0, canvas.width, canvas.height);
	
	context.lineWidth = 3;
    context.strokeStyle = "green";
	
	var point = create_point(null, null);
    for (var theta = 0; theta < 360; theta+=360/NUM_RAYS) {
        point = raytracer.trace_field(start, theta*Math.PI/180, 500, point);
        draw_line(context, start, point);
    }
	
	context.lineWidth = 1;
    context.strokeStyle = "black";
	for (var i = 0; i < obstacles.length; i++) {
		draw_poly(context, obstacles[i].polygon);
	}
    
	raytracer.draw(context);
}

function draw_poly(context, poly) {
    context.beginPath();
    context.moveTo(poly.points[0].x, poly.points[0].y);
    
    for (var i = 1; i < poly.points.length; i++) {
        context.lineTo(poly.points[i].x, poly.points[i].y);
    }
    
    context.lineTo(poly.points[0].x, poly.points[0].y);
    context.stroke();
}













































