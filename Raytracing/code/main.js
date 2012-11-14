var init_point = create_point(250, 250),
    world = null,
    context = null;

window.onload = function() {
  var ROWS = 15, COLS = 15;
  
  var canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  
  polys = [];
  
  var r = 30, d = 100;
  for (var i = 0; i < 100; i++) {
    var seedx = Math.random()*(canvas.width-2*d)+d,
        seedy = Math.random()*(canvas.height-2*d)+d,
        a1 = Math.random()*Math.PI*2/3,
        a2 = Math.random()*Math.PI*2/3,
        a3 = Math.random()*Math.PI*2/3;
    polys.push(create_polygon([
      {x: seedx + r*Math.cos(a1), y: seedy + r*Math.sin(a1)},
      {x: seedx + r*Math.cos(a1+a2), y: seedy + r*Math.sin(a1+a2)},
      {x: seedx + r*Math.cos(a1+a2+a3), y: seedy + r*Math.sin(a1+a2+a3)},
    ]));
  }
  
  world = create_world(COLS, ROWS, canvas.width/COLS, canvas.height/ROWS, polys);
  world.draw(context);  
  
  var point = {x:canvas.width/2, y:canvas.height/2};
  context.strokeStyle = "gray";
  for (var theta = 0; theta < 360; theta+=1000/360) {
    var point2 = trace(world, point, theta*Math.PI/180, context);
    
    if (!point2) {
      console.log(theta);
    } else {
      draw_line(context, point, point2);
    }
  }
}

function mousemove(event) {
  var mouse = null;
  
  if (event.offsetX) {
    mouse = {x: event.offsetX, y: event.offsetY};
  } else if (event.layerX) {
    mouse = {x: event.layerX - canvas.offsetLeft,
             y: event.layerY - canvas.offsetTop};
  } else {
    return;
  }
  
  context.fillStyle = "white";
  context.fillRect(0, 0, world.cols*world.cell_width, world.rows*world.cell_height);
  
  context.strokeStyle = "gray";
  for (var theta = 0; theta < 360; theta+=.3) {
    var point = trace(world, mouse, theta*Math.PI/180, context);
    draw_line(context, mouse, point);
  }
  
  world.draw(context);
}

function trace(world, start_point, heading) {
  var row = Math.round(start_point.y/world.cell_height-.5),
      col = Math.round(start_point.x/world.cell_width-.5),
      box = world.boxes[row][col],
      prev_box = null,
      intersection = create_point(start_point.x, start_point.y);
      
  var count = world.rows + world.cols + 1;
  
  var closest_dist = 1000,
      closest_intersection = null;
  
  while (box && count > 0) {
    var ray = create_ray(intersection, heading);
    
    for (var i = 0; i < box.edges.length; i++) {
      var p = intersects(ray, box.edges[i]);
      if (p) {
        var dist = euclidDist(p, start_point);
        if (dist < closest_dist) {
          closest_intersection = p;
          closest_dist = dist;
        }
      }
    }
  
    new_box = getNextBox(world, ray, box, prev_box, intersection);
    prev_box = box;
    box = new_box;
    
    count--;
  }
  
  if (count == 0) {
    console.log("yo we got an error up in this joint.");
    return;
  }
  
  if (!closest_intersection) {
    closest_intersection = intersection;
  }
  
  return closest_intersection;
}

//
// returns false if no next-box is found
//         null if the next-box is outside of the world
//         next-box otherwise--sets intersection
//
function getNextBox(world, ray, box, prev_box, intersection) {
  var next_box = false;
  var theta = (ray.theta%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  
  indexes = [0, 2, 1, 3];
  
  if (theta >= 0 && theta <= Math.PI/2) {
    indexes = [3, 1, 0, 2];
  } else if (theta > Math.PI/2 && theta <= Math.PI) {
    indexes = [0, 3, 1, 2];
  } else if (theta > Math.PI && theta <= 3*Math.PI/2) {
    indexes = [2, 0, 1, 3];
  } else if (theta > 3*Math.PI/2 && theta <= 2*Math.PI) {
    indexes = [2, 1, 0, 3];
  } 
  
  for (var i = 0; i < box.segments.length; i++) {
    var index = indexes[i];
    var p = intersects(ray, box.segments[index]);
    
    if (p) {
      intersection.x = p.x;
      intersection.y = p.y;
      
      next_box = box.adj_boxes[index];
      
      if (next_box != prev_box) {
        break;
      } else {
        next_box = false;
      }
    }
  }
  
  return next_box;
}

function intersects(ray, segment) {
  return lineSegmentIntersection(ray, segment);
}

function create_world(cols, rows, cell_width, cell_height, polys) {
  var points = new Array((rows+1)*(cols+1)),
      col_segs = new Array(rows),
      row_segs = new Array(cols),
      boxes = new Array(rows*cols);
  
  for (var r = 0; r < rows+1; r++) {
    points[r] = new Array(cols+1);
    for (var c = 0; c < cols+1; c++) {
      points[r][c] = create_point(c*cell_width, r*cell_height);
    }
  }
  
  for (var r = 0; r < rows; r++) {
    col_segs[r] = new Array(cols+1);
    for (var c = 0; c < cols+1; c++) {
      col_segs[r][c] = create_segment(points[r][c], points[r+1][c]);
    }
  }
  
  for (var c = 0; c < cols; c++) {
    row_segs[c] = new Array(rows+1);
    for (var r = 0; r < rows+1; r++) {
      row_segs[c][r] = create_segment(points[r][c], points[r][c+1]);
    }
  }
  
  for (var r = 0; r < rows; r++) {
    boxes[r] = new Array(cols);
    for (var c = 0; c < cols; c++) {
      var x = c*cell_width, 
          y = r*cell_height;
      boxes[r][c] = create_box(null, null, r, c, x, y, cell_width, cell_height);
    }
  }
  
  var dir_difs = [[0,-1],[0,1],[-1,0],[1,0]];
  
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var segs = [col_segs[r][c], col_segs[r][c+1], row_segs[c][r], row_segs[c][r+1]],
          adj_boxes = new Array(dir_difs.length),
          edges = [];
      
      for (var i = 0; i < dir_difs.length; i++) {
        var dir_dif = dir_difs[i],
            new_r = r + dir_dif[0],
            new_c = c + dir_dif[1];
            
        if (out_of_bounds(new_r, new_c, rows, cols)) {
          adj_boxes[i] = null;
        } else {
          adj_boxes[i] = boxes[new_r][new_c];
        }
      }
      
      for (var i = 0; i < polys.length; i++) {
        for (var j = 0; j < polys[i].lines.length; j++) {
          for (var k = 0; k < segs.length; k++) {
            if (lineSegmentIntersection(polys[i].lines[j], segs[k])
              || boxes[r][c].containsPoint(polys[i].lines[j].p1)) {          
              edges.push(polys[i].lines[j]);
              break;
            }
          }
        }
      }
      
      boxes[r][c].segments = segs;
      boxes[r][c].adj_boxes = adj_boxes;
      boxes[r][c].edges = edges;
    }
  }
  
  return {
    points: points,
    row_segs: row_segs,
    col_segs: col_segs,
    boxes: boxes,
    cell_width: cell_width,
    cell_height: cell_height,
    rows: rows,
    cols: cols,
    polys: polys,
    
    draw: function(context) {
      context.strokeStyle = "black";
      
      for (var r = 0; r < rows+1; r++) {
        draw_line(context, points[r][0], points[r][cols]);
      }
      
      for (var c = 0; c < cols+1; c++) {
        draw_line(context, points[0][c], points[rows][c]);
      }
      
      for (var i = 0; i < polys.length; i++) {
        draw_poly(context, polys[i]);
      }
      
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          context.fillText(""+boxes[r][c].edges.length, c*cell_width+cell_width/2, r*cell_height+cell_height/2);
        }
      }
    }
  }
}

function create_point(x, y) {
  return {x:x, y:y};
}

function create_ray(point, heading) {
  return create_line_from_vector(point, heading, 1000);
}

function create_segment(point1, point2) {
  return create_line(point1, point2);
}

function create_box(segments, adj_boxes, row, col, x, y, width, height) {
  return {
    segments: segments,
    adj_boxes: adj_boxes,
    x: x, 
    y: y,
    width: width,
    height: height,
    row: row, 
    col: col,
    poly: create_boxpoly(x, y, width, height),
    
    containsPoint: function(p) {
      return p.x >= x && p.x <= x+width && p.y >= y && p.y <= y+height;
    },
    
    draw: function(context) {
      context.fillStyle = "brown";
      
      context.fillRect(this.x, this.y, this.width, this.height);
    }
  };
}

function draw_poly(context, poly) {
  context.beginPath();
  context.moveTo(poly.points[0].x, poly.points[0].y);
  for (var i = 1; i < poly.points.length; i++) {
    context.lineTo(poly.points[i].x, poly.points[i].y);
  }
  context.lineTo(poly.points[0].x, 
                 poly.points[0].y);
  context.stroke();
}

function draw_line(context, p1, p2) {
  context.beginPath();
  context.moveTo(p1.x, p1.y);
  context.lineTo(p2.x, p2.y);
  context.stroke();
}

function out_of_bounds(r, c, rows, cols) {
  return r >= rows || c >= cols || r < 0 || c < 0;
}
















































