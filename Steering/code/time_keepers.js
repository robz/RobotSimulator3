
function realtime_timekeeper() {
	return {
		getTime: function() {
			return new Date().getTime();
		},
		update: function() {}
	}
}

// I hate using this global but don't know javascript well enough to get around it.
var gametime;

function gametime_timekeeper() {
	return {
		paused: false,
		init: function() {
			gametime = 0;
		},
		getTime: function() {
			return gametime;
		},
		update: function(inc) {
			if (!this.paused) {
				gametime += inc;
			}
		},
		pause: function() {
			this.paused = true;
		},
		unpause: function() {
			this.paused = false;
		}	
	};
}
