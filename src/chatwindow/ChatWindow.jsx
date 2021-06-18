import React, { Component } from "react";
import "../css/ChatStyle.css";
import ChatBox from "./ChatBox";
import InputArea from "./InputArea";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

class ChatWindow extends Component {
    render() {
        return (
            <div className="ChatWindow">
                <div className="chatHeader">
                    <div className="frnd_info">
                        <img
                            src={`http://${window.location.hostname}:3001/uploads/${this.props.chat.pic}`}
                            alt=""
                        />
                        <h5>{this.props.chat.name}</h5>
                    </div>
                    <ArrowBackIcon
                        className="back"
                        style={{
                            fontSize: 32,
                            display: this.props.activeBack ? "block" : "none",
                        }}
                        onClick={this.props.back}
                    />
                </div>
                <ChatBox
                    msges={this.props.chat.msges}
                    addElement={this.props.addElement}
                />
                <InputArea
                    // takeInput={this.props.takeInput}
                    // textValue={this.state.textValue}
                    addElement={this.props.addElement}
                    send={this.props.send}
                />
            </div>
        );
    }
}

export default ChatWindow;
