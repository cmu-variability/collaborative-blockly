// memory - instruction memory instruction_memory
// data memory
// stack



// thread
// ip - instruction pointer
// sp - stack pointer
// fp - base of frame pointer

// repeat 5 [ fd 10 rt 90 ]


// Logo OpCodes
const OpCodes =  Object.freeze({ 
    DONE: 0,
    DATA: 1,
    ILIST: 2,
    EOL: 3,
    EOLR: 4, 
    LGET: 5,
    LSET: 6,
    UFUN: 7,
    FOREVER: 8
});

// look back in original VM code for lget and lset
// write stack-printing function

// ILIST = 1
// EOL = 2 
// EOLR = 3
// LGET = 4
// LSET = 5
// UFUN = 6

// PRIM_NUM = 10
// PRIM_STRING = 11
// PRIM_DLIST = 12

const TurtleOpCodes =  Object.freeze({ 
    FD: 10,
    BK: 11,
    RT: 12,
    PEN_UP: 13,
    PEN_DOWN: 14,
    START_WAIT: 15,
    CHECK_WAIT: 16
});


let ip = 0;
let sp = 0;
let stack = [];
let instruction_memory = [];

function dispatch(sprite) {
    var wait_time = 0.0;
    var list_len = 0;

    while (true)
    { 
        var here = instruction_memory[ip++];  
        switch(here) {
                case OpCodes.DONE: 
                    return;
                case OpCodes.DATA: 
                    stack[sp++] = instruction_memory[ip++];
                    break;
                case TurtleOpCodes.FD: 
                    var steps = stack[--sp];
                    sprite.forward(steps);
                    break;

                case TurtleOpCodes.BK: 
                    var steps = stack[--sp];
                    sprite.backward(steps);
                    break;

                case TurtleOpCodes.RT: 
                    var degrees = stack[--sp];
                    sprite.rotate(degrees);
                    break;

                case TurtleOpCodes.PEN_UP: 
                sprite.pen_down = false;
                    break;
                
                case TurtleOpCodes.START_WAIT:
                    wait_time = stack[--sp] + performance.now();
                    break;

                case TurtleOpCodes.CHECK_WAIT:
                    if (wait_time < performance.now())
                    {
                        ip++;
                        // wait_time = 0;
                    }
                    break;
                
                case OpCodes.ILIST:
                    list_len = stack[--sp];
                    break;
                
                case OpCodes.EOL:
                    ip -= list_len;
                    break;
            }
    }


}

function run_instruction(instruction, sprite)
{
    ip = 0;
    sp = 0;
    stack = [];
    instruction_memory = instruction;

    dispatch(sprite);
    
}



export const run = (instruction_string, sprite) => {
   const instruction = instruction_string.substring(1,instruction_string.length).split(",");
   let new_instruction = []
   instruction.forEach(code => {
    new_instruction.push(parseInt(code));
    
   });
   console.log(new_instruction);
   run_instruction(new_instruction, sprite);
   console.log("exited loop");

};



// setup game - put hat for setup game and a hat for run (think start and update)
// pause - start at the beginning of instruction


// instruction_memory [ DATA 10 FD DONE ]
// stack []
// ip = 0
// sp = 0

// instruction_memory[0] 
// ip = 1

// instruction_memory[1]
// ip = 2
// stack[0] = 10
// sp = 1

// instruction_memory[2]
// ip = 3
// stack[0] 
// sp = 0
// turtle.forward(popped value from stack)

// ---------------