let t;
function preload() {
    let turtleCanvas = document.getElementById("turtle_canvas");
    let lineCanvas = document.getElementById("line_canvas");
    t = new Turtle(300, 300, turtleCanvas.getContext("2d"), lineCanvas.getContext("2d"));
}



  
function draw() {
   t.update_turtle();
//    window.requestAnimationFrame(draw); 
}

preload();