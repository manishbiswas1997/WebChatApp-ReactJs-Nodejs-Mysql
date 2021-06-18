import React from "react";
import SendRoundedIcon from "@material-ui/icons/SendRounded";

function SendButton(props) {
    return (
        <SendRoundedIcon
            className="sendButton"
            style={{ fontSize: 32 }}
            onClick={props.send}
        />
        // <button className="sendButton" onClick={props.send}>
        //     {" "}
        //     >{" "}
        // </button>
    );
}

export default SendButton;
