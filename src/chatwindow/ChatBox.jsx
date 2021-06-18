import React, { Component } from "react";
import Message from "./Message";

class ChatBox extends Component {
    render() {
        let messages = [];
        let msg;
        let i = 0;
        let j = 0;
        let lastDate = null;
        while (i < this.props.msges.length) {
            msg = this.props.msges[i];
            if (lastDate === msg.date) {
                //key={`${msg.id}_${msg.self}`}
                messages[messages.length] = <Message key={j++} msg={msg} />;
                i++;
            } else {
                lastDate = msg.date;
                messages[messages.length] = (
                    <span key={j++} className="chatDate">
                        {lastDate}
                    </span>
                );
            }
        }
        // console.log("ami");
        return (
            <div className="ChatBox" ref={this.props.addElement}>
                {messages}
            </div>
        );
    }
}

export default ChatBox;
