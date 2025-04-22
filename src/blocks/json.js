/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview All the custom JSON-related blocks defined in the custom
 * generator codelab.
 */

import * as Blockly from 'blockly';

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    "type": "Forward",
    "tooltip": "",
    "helpUrl": "",
    "message0": "Forward %1",
    "args0": [
      {
        "type": "input_value",
        "name": "steps",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 90,
    "inputsInline": false
  },
  {
    "type": "Rotate",
    "tooltip": "",
    "helpUrl": "",
    "message0": "Rotate %1",
    "args0": [
      {
        "type": "input_value",
        "name": "steps",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 90,
    "inputsInline": false
  },
  {
    "type": "start",
    "tooltip": "",
    "helpUrl": "",
    "message0": "%1 %2",
    "args0": [
      {
        "type": "field_label_serializable",
        "text": "Start",
        "name": "Start"
      },
      {
        "type": "input_statement",
        "name": "commands"
      }
    ],
    "colour": 285
  }
                      
                      
                      
]);
