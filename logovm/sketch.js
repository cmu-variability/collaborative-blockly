// Load the image and create a p5.Image object.
let t;
function preload() {
    t = new Turtle(300,300);
    t.load_turtle_image('images/turtle.png');
}


function setup() {
    createCanvas(600, 600);
}


  
function draw() {
    background(220);
    if (t.y <= 200 && t.heading == 0)
    {
        t.rotate(3);
    } else if (t.x <= 200 && t.heading == 3)
    {
        t.rotate(2);
    } 
    else if (t.y >= 300 && t.heading == 2)
    {
        t.rotate(1);
    } else if (t.x >= 300 && t.heading == 1)
    {
        t.rotate(0);
    } 
    else {
        t.forward(1);
    }
    t.update_turtle();
    
    
}