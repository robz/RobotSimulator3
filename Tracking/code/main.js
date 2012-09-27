var VAR = 50;
var CANVAS_WIDTH, CANVAS_HEIGHT, canvas, context;
var state, GPS, mouse;

var xy, Pxy;
var u, F, H, R, Q, I;

var oldTime, started;

window.onload = function() 
{
	canvas = document.getElementById("canvas");
	context = canvas.getContext("2d");
	
	CANVAS_WIDTH = canvas.width;
	CANVAS_HEIGHT = canvas.height;
	
	GPS = create_GPS(0, 0);
	state = create_state(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 0, 0, 0, 0, 10);
	mouse = create_point(0, 0);
	
	xy = $M([[0], [0], [0], [0], [0], [0]]);
	
	Pxy = $M([[1000,0,0,0,0,0], 
			  [0,1000,0,0,0,0], 
			  [0,0,1000,0,0,0], 
			  [0,0,0,1000,0,0], 
			  [0,0,0,0,1000,0], 
			  [0,0,0,0,0,1000]]);
	
	u = $M([[0], [0], [0], [0], [0], [0]]), 		// external motion (control vector)
	
	H = $M([[1,0,0,0,0,0],
			[0,0,0,1,0,0]]), 						// measurement function
			
	R = $M([[VAR, 0],[0, VAR]]), 								// measurement uncertainty 
	
	Q = $M([[1e-6,0,0,0,0,0], 
			[0,1e-12,0,0,0,0], 
			[0,0,1e-10,0,0,0],
			[0,0,0,1e-6,0,0], 
			[0,0,0,0,1e-12,0], 
			[0,0,0,0,0,1e-10]]);	// process uncertainty covariance
	
	I = Matrix.I(6), 			// identity matrix
	
	started = false;
	
	setInterval(paintCanvas, 30);
	setInterval(updateGPS, 50);
	setInterval(kalman_iteration, 50);
};

function matrixStr(matrix) {
	var str = "[", p1 = "";
	for (var r = 0; r < matrix.elements.length; r++) {
		str += p1+"[";
		var p2 = "";
		for(var c = 0; c < matrix.elements[r].length; c++) {
			str += p2+matrix.elements[r][c];
			p2 = ",";
		}
		str += "]";
		p1 = ",\n ";
	}
	str += "]";
	return str;
}

function paintCanvas() {
	context.fillStyle = "lightGray";
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	context.strokeStyle = "black";
	context.lineWidth = 3;
	context.beginPath();
	context.arc(state.x, state.y, state.r, 0, 2*Math.PI, true);
	context.stroke();
}

function updateGPS() {
	if (started) {
		var theta = Math.PI*Math.random(),
			R = gauss(0, VAR);
		GPS.update(mouse.x + R*Math.cos(theta), mouse.y + R*Math.sin(theta));
	}
}

function kalman_iteration() {
	if (GPS.hasChanged) {
		var cur_time = new Date().getTime();
		if (!oldTime) {
			oldTime = cur_time;
		} 
		var delta_time = cur_time - oldTime;
		oldTime = cur_time;
		
		var z, error, S, K;
		var measurement = GPS.read();
		
		F = $M([[1, delta_time, .5*delta_time*delta_time, 0, 0, 0], 
				[0, 1, delta_time, 0, 0, 0],
				[0, 0, 1, 0, 0, 0],
				[0, 0, 0, 1, delta_time, .5*delta_time*delta_time],
				[0, 0, 0, 0, 1, delta_time],
				[0, 0, 0, 0, 0, 1]]), 		// next state function
		
		// measurement
		z = $M([[measurement.x],[measurement.y]]);
		error = z.subtract(H.multiply(xy));
		S = (H.multiply(Pxy.multiply(H.transpose()))).add(R);
		K = Pxy.multiply(H.transpose().multiply( S.inverse() ));
		xy = xy.add(K.multiply(error));
		Pxy = (I.subtract(K.multiply(H))).multiply(Pxy);
		
		// prediction
		xy = (F.multiply(xy)).add(u);
		Pxy = F.multiply(Pxy.multiply(F.transpose())).add(Q);
		
		// update
		state.update(xy.elements[0][0], xy.elements[1][0], xy.elements[2][0],
					 xy.elements[3][0], xy.elements[4][0], xy.elements[5][0]);
	}
}

function mouseMoved(event) {
	started = true;

    if(event.offsetX) {
        mouse.x = event.offsetX;
        mouse.y = event.offsetY;
    }
    else if(event.layerX) {
        mouse.x = event.layerX-canvas.offsetLeft;
        mouse.y = event.layerY-canvas.offsetTop;
    }
}

function gauss(mean, variance) {
	// Box-muller transform
	var r1 = Math.random(), r2 = Math.random();
	return mean+Math.sqrt(variance)*Math.sqrt(-2*Math.log(r1))*Math.cos(2*Math.PI*r2);
}

function create_GPS(init_x, init_y) {
	return {
		p: create_point(init_x, init_y),
		hasChanged: false,
		update : function(newx, newy) {
			this.p.x = newx;
			this.p.y = newy;
			this.hasChanged = true;
		},
		read: function() {
			this.hasChanged = false;
			return this.p;
		}
	};
}

function create_state(x, y, vx, vy, ax, ay, r) {
	return {
		x: x,
		y: y,
		vx: vx,
		vy: vy,
		ax: ax,
		ay: ay,
		r: r,
		update: function(new_x, new_vx, new_ax, new_y, new_vy, new_ay) {
			this.x = new_x;
			this.vx = new_vx;
			this.ax = new_ax;
			this.y = new_y;
			this.vy = new_vy;
			this.ay = new_ay;
		}
	};
}
