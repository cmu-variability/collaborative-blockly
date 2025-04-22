// input blocks
// output instruction_memory 
// link: output map [ block-stack location in instruction memory
// 
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The full custom JSON generator built during the custom
 * generator codelab.
 */

import * as Blockly from 'blockly';

export const jsonGenerator = new Blockly.Generator('JSON');

const Order = {
  ATOMIC: 0,
};

jsonGenerator.scrub_ = function (block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + ',\n' + jsonGenerator.blockToCode(nextBlock);
  }
  return code;
};

jsonGenerator.forBlock['logic_null'] = function (block) {
  return ['null', Order.ATOMIC];
};

jsonGenerator.forBlock['text'] = function (block) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['math_number'] = function (block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['logic_boolean'] = function (block) {
  const code = block.getFieldValue('BOOL') == 'TRUE' ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

jsonGenerator.forBlock['member'] = function (block, generator) {
  const name = block.getFieldValue('MEMBER_NAME');
  const value = generator.valueToCode(block, 'MEMBER_VALUE', Order.ATOMIC);
  const code = `"${name}": ${value}`;
  return code;
};

jsonGenerator.forBlock['lists_create_with'] = function (block, generator) {
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = generator.valueToCode(block, 'ADD' + i, Order.ATOMIC);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  const indentedValueString = generator.prefixLines(
    valueString,
    generator.INDENT,
  );
  const codeString = '[\n' + indentedValueString + '\n]';
  return [codeString, Order.ATOMIC];
};

jsonGenerator.forBlock['object'] = function (block, generator) {
  const statementMembers = generator.statementToCode(block, 'MEMBERS');
  const code = '{\n' + statementMembers + '\n}';
  return [code, Order.ATOMIC];
};

// to square
// repeat 4 [ fd 10 rt 90]
// end  

//  instruction_memory 0
// UFUN SQUARE 0 DATA 4 ILIST 7 DATA 10 FD DATA 90 RT EOL REPEAT EOL


// instruction_memory 16
// UFUN DIAMOND 0 DATA 45 RT DATA 4 ILIST 6 CALLFUNC SQUARE DATA 90 RT EOL REPEAT EOL  


// output_map [ square:0 , diamond: 16]

// link 
// UFUN DIAMOND 0 DATA 45 RT DATA 4 ILIST 6 CALLFUNC 0 DATA 90 RT EOL REPEAT EOL  




// to diamond   
// rt 45
// repeat 4 [ square rt 90 ]
// end







// var compile() {
//     // compile all functions
//     // for all stacks 
//     //    compile-stack 
//     // 
//     // for all blocks in block-stack
//     //    compile-block
//     // link all functions
//     // for all functions that you have compiled
//     //    for all opcodes
//     //       for all ufun opcodes 
//     //          lookup the function location in the output map and swap in the location into instruction_memory




// }