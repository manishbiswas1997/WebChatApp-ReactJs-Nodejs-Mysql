import React, { Component } from "react";
import TextInput from "./TextInput";
import SendButton from "./SendButton";

class InputArea extends Component {
    render() {
        return (
            <div className="InputArea">
                <TextInput
                    // textvalue={this.props.textValue}
                    // takeInput={this.props.takeInput}
                    addElement={this.props.addElement}
                />
                <SendButton
                    // textvalue={this.props.textValue}
                    send={this.props.send}
                />
            </div>
        );
    }
}

export default InputArea;
