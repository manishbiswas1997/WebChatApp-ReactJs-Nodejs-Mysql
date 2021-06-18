import React from "react";

function TextInput(props) {
    // console.log("naaa ami");
    return (
        <textarea
            className="TextInput"
            // value={props.textvalue}
            // autoFocus={true}
            ref={props.addElement}
            // onkeyp
            // onChange={props.takeInput}
            placeholder="Type msg here.."
        />
    );
}

export default TextInput;
