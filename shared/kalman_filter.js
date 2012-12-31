function kalman_filter(init_x, init_y, variance, Q) 
{
    this.state_x = init_x;
    this.state_y = init_y;
    this.variance = variance;
    this.verbosity_level = 1;

    this.xy = $M([[0], [0], [0], [0], [0], [0]]);
    
    this.Pxy = $M([[1000,0,0,0,0,0], 
                   [0,1000,0,0,0,0], 
                   [0,0,1000,0,0,0], 
                   [0,0,0,1000,0,0], 
                   [0,0,0,0,1000,0], 
                   [0,0,0,0,0,1000]]);
    
    // process uncertainty covariance
    this.Q = Q;
    
    // measurement uncertainty 
    this.R = $M([[variance, 0],
                 [0, variance]]), 
    
    // external motion (control vector)
    this.u = $M([[0], [0], [0], [0], [0], [0]]), 		
    
    // measurement function
    this.H = $M([[1,0,0,0,0,0],
                 [0,0,0,1,0,0]]);	
    
    // identity matrix
    this.I = Matrix.I(6), 	
    
    this.iterate = function(measurement_x, measurement_y) {
		var dt = 1;
            
        var u = this.u, H = this.H, R = this.R, Q = this.Q, I = this.I;
        var z, error, S, K;
            
        // next state function
        F = $M([[1, dt, .5*dt*dt, 0, 0, 0], 
                [0, 1, dt, 0, 0, 0],
                [0, 0, 1, 0, 0, 0],
                [0, 0, 0, 1, dt, .5*dt*dt],
                [0, 0, 0, 0, 1, dt],
                [0, 0, 0, 0, 0, 1]]), 		
            
        // measurement
        z = $M([[measurement_x], [measurement_y]]);
        error = z.subtract(H.multiply(this.xy));
        S = (H.multiply(this.Pxy.multiply(H.transpose()))).add(R);
        K = this.Pxy.multiply(H.transpose().multiply(S.inverse()));
        this.xy = this.xy.add(K.multiply(error));
        this.Pxy = (I.subtract(K.multiply(H))).multiply(this.Pxy);
            
        // prediction
        this.xy = (F.multiply(this.xy)).add(u);
        this.Pxy = F.multiply(this.Pxy.multiply(F.transpose())).add(Q);
            
        // update
        this.state_x = this.xy.elements[0][0];
        this.state_y = this.xy.elements[3][0];
    };
    
    this.draw = function(context) {
        if (this.verbosity_level == 0) {
            return;
        }
        
	    context.beginPath();
	    context.arc(this.state_x, this.state_y, variance/4, 0, 2*Math.PI, true);
	    context.stroke();
    }
}
