function Turtle(startX, startY){

    this.turtle_img;
    this.x = startX;
    this.y = startY;
    this.pen_down = true;
    this.pen_color = color(255,0,0);
    this.isMoving = true;
    this.pen_start = this.y;

    // second canvas
    this.old_lines = [];

    // translate logo coords to p5 coords

    // define directions
    const direction =  Object.freeze({ 
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    });

    this.heading = direction.UP;

    this.load_turtle_image = () =>
    {
        this.turtle_img = loadImage('images/turtle.png')

    }

    this.draw_turtle = () =>
    {
        angleMode(DEGREES);
        translate(this.x, this.y);
        rotate(90*this.heading)
        image(this.turtle_img, -this.turtle_img.width/2, -this.turtle_img.height/2);
        rotate(-90*this.heading);
        translate(0, 0);
        
    }

    this.update_turtle = () =>
    {

        this.draw_pen();
        this.draw_turtle();

        
    }

    this.draw_turtle = () =>
    {
        translate(this.x, this.y);
        rotate((Math.PI/2)*this.heading)
        image(this.turtle_img, -this.turtle_img.width/2, -this.turtle_img.height/2);
        translate(0, 0);
        rotate(-1*(Math.PI/2)*this.heading)
    }

    this.draw_pen = () =>
    {
        if (this.pen_down)
        {
            if (this.heading == direction.UP || this.heading == direction.DOWN)
            {
                this.draw_line(this.pen_start, this.y, this.pen_color, false);
            } else {
                this.draw_line(this.pen_start, this.x, this.pen_color, true);
            }
        } else {
            if (this.heading == direction.UP || this.heading == direction.DOWN)
            {
                this.pen_start = this.y;
            } else {
                this.pen_start = this.x;
            }  
        }

        this.old_lines.forEach(oldline => {
            line(oldline[0], oldline[1], oldline[2], oldline[3]);
        });
    }

    this.draw_line = (start, end, color, horizontal) => {
        stroke(color);
        if (horizontal)
        {
            line(start, this.y, end, this.y);
        } else {
            line(this.x, start, this.x, end);
        }

    }

    this.forward = (steps) =>
    {
        // TODO: Check for out of bounds movements
        if (this.heading == direction.UP)
        {
            this.y -= steps;
        } else if (this.heading  == direction.DOWN)
        {
            this.y += steps;
           
        } else if (this.heading  == direction.RIGHT)
        {
            this.x += steps;
        } else if (this.heading  == direction.LEFT)
        {
            this.x -= steps;
        }
    }

    this.backward = (steps) =>
    {
       this.forward(-1*steps);
    }

    this.rotate = (newHeading) =>
    {
        if (newHeading != this.heading)
        {
            if (this.heading == direction.UP || this.heading == direction.DOWN)
            {
                if (this.pen_down)
                {
                    this.old_lines.push([this.x, this.pen_start, this.x, this.y]);
                }    

            } else {
                if (this.pen_down)
                {
                    this.old_lines.push([this.pen_start, this.y, this.x, this.y]);
                }
            }

    
            this.heading = newHeading;
            if (this.heading == direction.UP || this.heading == direction.DOWN)
            {
                this.pen_start = this.y;
            } else {
                this.pen_start = this.x;
            }

            
        } 
        
    }
   
}
