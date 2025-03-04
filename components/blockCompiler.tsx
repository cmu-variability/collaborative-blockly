import Blockly from 'blockly';


function handleIf(block, stack)
{
    const inputs = block.inputs;
    // const if0 = (inputs && inputs.IF0) ? parseBlock(inputs.IF0.block) : "";
    // const do0 = (inputs && inputs.D0) ? parseBlock(inputs.D0.block) : "";
    // const next = block.next ? "\n" + parseBlock(block.next.block) : "";
    // return "if " + if0 + "\n\t[" + do0 + "]" + next;
}

function handleCompare(block, stack)
{
    const inputs = block.inputs;
    const OP = block.fields?.OP;
    // const A = parseBlock(inputs.A.block);
    // const B = parseBlock(inputs.B.block);

    // let operator = "";
    // if (OP == "EQ")
    // {
    //     operator = "=";
        
    // } else if (OP == "NEQ") {
    //     operator = "!=";
    // } else if (OP == "LT")
    // {
    //     operator = "<";
    // } else if (OP == "GT")
    // {
    //     operator = ">";
    // } else if (OP == "LTE")
    // {
    //     operator = "<=";
    // } else if (OP == "GTE")
    // {
    //     operator = ">=";
    // }

    // return A + " " + operator + " " + B;
}


function handleNum(block, stack)
{

    // data op code, value
    stack.push(block.getField("NUM").getValue());
}

function parseBlock(block, stack) 
{
    try {
        switch (block.type)
        {
            case "controls_if":
            {
                handleIf(block, stack);
            }

            case "logic_compare":
            {
                handleCompare(block, stack);
            }

            case "math_number":
            {
                handleNum(block, stack);
            }

            case "variables_get":
            {
            
                
            }

            case "variables_set":
            {
                        
            }

            default:
            {

            }
        }
    } catch (error) {
        
    }
}

function WorkspaceToLOGO(workspace : Blockly.WorkspaceSvg)
{  
    let stack : Array<number> = new Array();
 
    workspace.getAllBlocks(true).forEach(block => {
        parseBlock(block, stack)
    });

    return;

   
}

export default WorkspaceToLOGO;
