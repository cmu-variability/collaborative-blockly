// input blocks
// output instruction_memory 
// link: output map [ block-stack location in instruction memory
// 


to square
repeat 4 [ fd 10 rt 90]
end  

 instruction_memory 0
UFUN SQUARE 0 DATA 4 ILIST 7 DATA 10 FD DATA 90 RT EOL REPEAT EOL


instruction_memory 16
UFUN DIAMOND 0 DATA 45 RT DATA 4 ILIST 6 CALLFUNC SQUARE DATA 90 RT EOL REPEAT EOL  


output_map [ square:0 , diamond: 16]

link 
UFUN DIAMOND 0 DATA 45 RT DATA 4 ILIST 6 CALLFUNC 0 DATA 90 RT EOL REPEAT EOL  




to diamond   
rt 45
repeat 4 [ square rt 90 ]
end







var compile() {
    // compile all functions
    // for all stacks 
    //    compile-stack 
    // 
    // for all blocks in block-stack
    //    compile-block
    // link all functions
    // for all functions that you have compiled
    //    for all opcodes
    //       for all ufun opcodes 
    //          lookup the function location in the output map and swap in the location into instruction_memory




}