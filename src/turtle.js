function Turtle(startX, startY, turtleCtx, lineCtx){

    // canvas contexts
    this.turtleCtx = turtleCtx;
    this.lineCtx = lineCtx;

    // turtle images
    this.turtle_img = new Image();
    this.img_loaded = true;
    this.turtle_img.onload = (_) => {
        this.img_loaded = true;
    }
    // this.turtle_img.src = 'images/turtle.png';

    // turtle movement
    this.x = startX;
    this.y = startY;
    this.speed = 1.0;

    // pen drawing
    this.lineBitmap = lineCtx.createImageData(lineCtx.canvas.width, lineCtx.canvas.height);

    this.bresenhamLine = (x1, y1, x2, y2, color) => {

        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);


        const setColor = (pixelX, pixelY, width) => {
            const red = pixelY * (width * 4) + pixelX * 4;

        

            this.lineBitmap.data[red] = color[0];
            this.lineBitmap.data[red+1] = color[1];
            this.lineBitmap.data[red+2] = color[2];
            this.lineBitmap.data[red+3] = 255; // set opacity to 1

          };

        //   console.log(`${x1}, ${y1} to ${x2}, ${y2}`);
        
        
        // run algorithm where i is the longer axis and j is the shorter axis
        const bresenhamHelper = (i1, j1, i2, j2, isXLonger) => {

            // ensure we're starting at the smaller value along the longer axis
            if (i1 > i2)
            {
                let old_i1 = i1;
                i1 = i2;
                i2 = old_i1; 

                let old_j1 = j1;
                j1 = j2;
                j2 = old_j1; 
            }

            let start = Math.floor(i1);
            let end = Math.floor(i2);
            let u = start; 

            while (u <= end)
            {
                let i_to_shade = Math.floor(u);
                let j_to_shade = j1 + Math.floor(((u - i1) * (j2 - j1)) / (i2 - i1));;

                let x_to_shade = isXLonger ? i_to_shade : j_to_shade;
                let y_to_shade = isXLonger ? j_to_shade : i_to_shade;

                setColor(x_to_shade, y_to_shade, this.lineCtx.canvas.width);
                u+=1;
                
            }


        };

        if (Math.abs(x2-x1) > Math.abs(y2-y1))
        {
            bresenhamHelper(x1,y1,x2,y2, true);
        } else {
            bresenhamHelper(y1,x1,y2,x2, false);
        }        
    
    }

    
      

    this.pen_down = true;
    this.pen_color = "rgba(255, 0, 0, 0)";
    this.isMoving = true;
    this.pen_start = this.y;
    



    

    // translate logo coords to p5 coords
    this.heading = 0;


    this.draw_turtle = () =>
    {
        console.log(this.x + ", " + this.y);
        this.turtleCtx.clearRect(0, 0, this.turtleCtx.canvas.width, this.turtleCtx.canvas.height);
        this.turtleCtx.translate(this.x, this.y);
        this.turtleCtx.rotate(this.heading)
        // this.turtleCtx.drawImage(this.turtle_img, -this.turtle_img.width/2, -this.turtle_img.height/2);
        this.turtleCtx.fillStyle = "green";
        this.turtleCtx.fillRect(0, 0, 50,50);
        this.turtleCtx.rotate(-this.heading);
        this.turtleCtx.translate(-this.x, -this.y);
        
    }

    this.update_turtle = () =>
    {

        if (this.img_loaded)
        {
            this.draw_turtle();
            this.draw_pen();

        }

        this.draw_pen();


        
    }

    this.draw_pen = () =>
    {

        // calculate fraction of canvas is filled with pixels
        // treat as bitmap

        // 14 primary colors
        // rainbow + brown/grey
        // hsb color wheel (0, 360), brown and for grey
        // 10 shades of those primary colors
        // primary color to white, 5 shades from each through linear interpolation

        // 0-70 color (word is center shade, words from primary colors)
        
        this.lineCtx.putImageData(this.lineBitmap, 0, 0);


    }


   

    this.forward = (steps) =>
    {

        // Note: since heading is oriented with 0 upward, x is the sin component
        // and y is the cos component
        let prevX = this.x;
        let prevY = this.y;
        this.x += this.speed*steps*Math.sin(this.heading);
        this.y += this.speed*-steps*Math.cos(this.heading);

        if (this.pen_down)
        {
           this.bresenhamLine(prevX, prevY, this.x, this.y, [255,0,0]);
        }

    }

    this.backward = (steps) =>
    {
       this.forward(-1*steps);

    }

    this.rotate = (degrees) =>
    {
        // convert to radians
       this.heading += (degrees)*(Math.PI/180.0);

       // clamp to [0, 2*PI)
       this.heading = this.heading >= 2*Math.PI ? 
                    this.heading - (2*Math.PI) : this.heading;
    
    }
   
}

export default Turtle;