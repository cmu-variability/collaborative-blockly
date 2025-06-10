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

export const logoGenerator = new Blockly.Generator('LOGO');

const Order = {
  ATOMIC: 0,
};

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

logoGenerator.forBlock['math_number'] = function (block) {
  const code = String(block.getFieldValue('NUM'));
  return [`${OpCodes.DATA},${code}`, Order.ATOMIC];
};

logoGenerator.forBlock['Forward'] = function (block, generator) {
  const value = generator.valueToCode(block, 'steps', Order.ATOMIC);
  const code = `${value},${TurtleOpCodes.FD}`;
  return code;
};

logoGenerator.forBlock['Rotate'] = function (block, generator) {
  const value = generator.valueToCode(block, 'steps', Order.ATOMIC);
  const code = `${value},${TurtleOpCodes.RT}`;
  return code;
};


logoGenerator.forBlock['start'] = function (block, generator) {
  let commands = generator.statementToCode(block, 'commands'); 

  // for some reason, statementToCode from Blockly inserts an indent automatically
  commands = commands.substring(1,commands.length);

  const code = `${commands},${OpCodes.DONE}`;
  return code;
};

logoGenerator.forBlock['for_miliseconds'] = function(block, generator) {
  const duration = block.getFieldValue('NAME');

  let commands = generator.statementToCode(block, 'commands');
  // for some reason, statementToCode from Blockly inserts an indent automatically
  commands = commands.substring(1,commands.length);

  // length + 2 because we add a CHECK_WAIT and EOL opcode into the end of the ILIST
  const num_commands = commands.split(",").length + 2;
  
  const code = `${OpCodes.DATA},${duration},${TurtleOpCodes.START_WAIT},${OpCodes.DATA},${num_commands},${OpCodes.ILIST},${commands},${TurtleOpCodes.CHECK_WAIT},${OpCodes.EOL}`;
  return code;
}


logoGenerator.scrub_ = function (block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + "," + logoGenerator.blockToCode(nextBlock);

  }
  return code;
};

