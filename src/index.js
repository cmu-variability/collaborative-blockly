/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/json';
import {logoGenerator} from './generators/logo';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';
import { run } from './vm';

// Pixi.js code
import { Application, Assets, Sprite } from 'pixi.js';
import TurtleSprite from './turtle_sprite';


// Asynchronous IIFE
(async () =>
{
    // Create a PixiJS application.
    const app = new Application();
    

    // Intialize the application.
    await app.init({ background: '#1099bb', width: 600,
                  height: 600});

    // Then adding the application's canvas to the DOM body.
    document.getElementById("canvases").appendChild(app.canvas);

    // Load the bunny texture.
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    // Create a new Sprite from an image path.
    const bunny = new Sprite(texture);

    // Add to stage.
    app.stage.addChild(bunny);

    // Center the sprite's anchor point.
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen.
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    const turtle = new TurtleSprite(app, bunny);

    document.getElementById("run_button").onclick = () => {
      // create a function to execute a single instruction in the vm
      let vm_callback = run(code, turtle);

      // start the turtle
      turtle.start_turtle(vm_callback);


      document.getElementById("run_button").style.display = "none";
      document.getElementById("reset_button").style.display = "block";

      
    };

    document.getElementById("reset_button").onclick = async () => {
      // stop the turtle (and the execution of code by extension)
      turtle.reset_turtle();
       
      document.getElementById("reset_button").style.display = "none";
      document.getElementById("run_button").style.display = "block";

    };

   
})();
//

// Register the blocks with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});
let code = "";

// This function resets the code div and shows the
// generated code from the workspace.
const getCode = () => {
  code = logoGenerator.workspaceToCode(ws);
};

// Load the initial state from storage and run the code.
load(ws);
getCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  getCode();
});


