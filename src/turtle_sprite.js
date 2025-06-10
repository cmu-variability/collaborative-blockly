import { Graphics, Ticker } from 'pixi.js';

function TurtleSprite(app, spriteRef){

    // PixiJS object references
    this.app = app;

    this.spriteRef = spriteRef;

    // the lines that the turtle draws
    this.lineGraphics = new Graphics();


    // lines are only drawn when the pen is down
    this.pen_down = true;
    // TODO: add block to change pen color
    this.pen_color = 0xffffff;


    // turtle movement
    this.x = this.spriteRef.x;
    this.y = this.spriteRef.y;
    this.speed = 1.0;
    this.heading = 0;
    
    // save the original position and heading to reset later
    this.originalX = this.spriteRef.x;
    this.originalY = this.spriteRef.y;
    this.originalHeading = this.heading;


    // update the actual sprite: called at every frame update during execution
    this.callback = (_) => {
        this.startX = this.spriteRef.x;
        this.startY = this.spriteRef.y;
        if (this.spriteRef.x != this.x ||
            this.spriteRef.y != this.y ||
            this.spriteRef.direction != this.heading)
        {
            this.spriteRef.x = this.x;
            this.spriteRef.y = this.y;

            this.spriteRef.direction = this.heading;
            this.spriteRef.rotation = this.heading;

            this.lineGraphics.moveTo(this.startX, this.startY)
                .lineTo(this.x, this.y)
                .stroke({ color: this.pen_color, pixelLine: true });
        }
 
    };

    // reset the sprite to original position and heading
    this.reset_redraw = (_) => 
    {
        console.log("STOPPING");
        this.spriteRef.x = this.originalX;
        this.spriteRef.y = this.originalY;
        this.x = this.originalX;
        this.y = this.originalY;

        this.spriteRef.direction = this.originalHeading;
        this.spriteRef.rotation = this.originalHeading;
        this.heading = this.originalHeading;

        this.app.stage.removeChildren();
        this.app.stage.addChild(this.spriteRef);
        this.app.ticker.stop();

    }



    

   
    

    this.reset_turtle = (_) =>
    {
        // stop the animation
        this.app.ticker.addOnce(this.reset_redraw);
        
        // no longer redraw the sprite after the final redraw
        this.app.ticker.remove(this.callback);


    
    }

    this.start_turtle = () =>
    {
        this.app.ticker.remove()

        // create new graphics object, add it to the stage
        this.lineGraphics = new Graphics();
        this.app.stage.addChild(this.lineGraphics);

        this.app.ticker.add(this.callback);

        // start "ticking" (i.e. animating at each frame)
        this.app.ticker.start();

    }

   


   

    this.forward = (steps) =>
    {
        // Note: since heading is oriented with 0 upward, x is the sin component
        // and y is the cos component

        this.x += this.speed*steps*Math.sin(this.heading);
        this.y += this.speed*-steps*Math.cos(this.heading);

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