var raytracer = null,
    context = null;

window.onload = function() {
  var ROWS = 15, COLS = 15;
  
  var canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  
  obstacles = [];
  
  var r = 30, d = 100;
  for (var i = 0; i < 100; i++) {
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
  
  raytracer = create_raytracer(COLS, ROWS, canvas.width/COLS, canvas.height/ROWS, obstacles);
  raytracer.draw(context);  
  
  var point = create_point(canvas.width/2, canvas.height/2);
  context.strokeStyle = "gray";
  for (var theta = 0; theta < 360; theta+=360/1000) {
    var res = raytracer.trace(point, theta*Math.PI/180, 500);
    
    if (!res) {
      console.log(theta);
    } else {
      draw_line(context, point, res);
    }
  }
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
  
  context.fillStyle = "white";
  context.fillRect(0, 0, raytracer.cols*raytracer.cell_width, 
                         raytracer.rows*raytracer.cell_height);
  
  context.strokeStyle = "gray";
  for (var theta = 0; theta < 360; theta+=360/1000) {
    var point = raytracer.trace(mouse, theta*Math.PI/180, 500);
    draw_line(context, mouse, point);
  }
  
  raytracer.draw(context);
}















































