
function drawCircle(circle) {
	context.lineWidth = 3;
	context.beginPath();
	context.arc(circle.c.x, circle.c.y, circle.r, 0, 2*Math.PI, true);
	context.stroke();
}

function drawGrid(grid) {
	context.fillStyle = "white";
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	context.fillStyle = "lightGray";
	for (var x = 0; x < COLS; x++) {
		for (var y = 0; y < ROWS; y++) {
			if (grid[x][y]) {
				context.fillRect(x*CELL_WIDTH, y*CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
			} 
		}
	}
}

function drawPoly(polygon) {
	var points = polygon.points;
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(points[0].x, points[0].y);
	for (i = 1; i < points.length; i++) {
		context.lineTo(points[i].x, points[i].y);
	}
	context.closePath();
	context.stroke();
}

function drawLines(lines) 
{
	context.beginPath();
	context.lineWidth = 2;
	context.moveTo(lines[0].p1.x, lines[0].p1.y);
	for(var i = 0; i < lines.length; i++) {
		context.lineTo(lines[i].p2.x, lines[i].p2.y);
	}
	context.stroke();
}
