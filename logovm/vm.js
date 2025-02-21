// memory - instruction memory instruction_memory
// data memory
// stack


const { createLessThan } = require("typescript");

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
    UFUN: 7
});

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
    BK: 11
});

const turtle = require('turtle-logo');


var dispatch() {
  while(true) {
    var here = instruction_memory[ip++];    
    switch(here) {
            case OpCodes.DONE: 
                return;
            case OpCodes.DATA: 
                stack[sp++] = instruction_memory[ip++];
                break;
            case TurtleOpCodes.FD: 
                var steps = stack[--sp];
                turtle.forward(steps);
                break;
        }
    }
}



instruction_memory [ DATA 10 FD DONE ]
stack []
ip = 0
sp = 0

dispatch()

instruction_memory[0] 
ip = 1

instruction_memory[1]
ip = 2
stack[0] = 10
sp = 1

instruction_memory[2]
ip = 3
stack[0] 
sp = 0
turtle.forward(popped value from stack)

---------------