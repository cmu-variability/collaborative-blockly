function TurtleSprite(app, spriteRef, lineGraphics){

    // PixiJS object references
    this.app = app;
    this.spriteRef = spriteRef;
    this.lineGraphics = lineGraphics;



    // turtle movement
    this.x = this.spriteRef.x;
    this.y = this.spriteRef.y;
    this.speed = 1.0;
    
      

    this.pen_down = true;
    this.pen_color = 0xffffff;
    this.isMoving = true;
    


    // translate logo coords to p5 coords
    this.heading = 0;

    this.app.ticker.add((_) => {
        if (this.spriteRef.x != this.x ||
            this.spriteRef.y != this.y
        )
        {
            this.lineGraphics.moveTo(this.spriteRef.x, this.spriteRef.y);
            this.spriteRef.x = this.x;
            this.spriteRef.y = this.y;
            this.spriteRef.direction = this.heading;
            
           
            // Draw down to bottom (x = i*10, y = 100)
            this.lineGraphics.lineTo(this.spriteRef.x, this.spriteRef.y);

            // Stroke all lines in white with pixel-perfect width
            this.lineGraphics.stroke({ color: this.pen_color, pixelLine: true });
        }
        
    });
    

    // this.update_turtle = () =>
    // {

    //     if (this.img_loaded)
    //     {
    //         this.draw_turtle();
    //         this.draw_pen();

    //     }

    //     this.draw_pen();


        
    // }

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
        // let prevX = this.x;
        // let prevY = this.y;
        this.x += this.speed*steps*Math.sin(this.heading);
        this.y += this.speed*-steps*Math.cos(this.heading);

        // if (this.pen_down)
        // {
        //    this.bresenhamLine(prevX, prevY, this.x, this.y, [255,0,0]);
        // }

        console.log(`${this.x}, ${this.y}`)

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

export default TurtleSprite;