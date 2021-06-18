import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Chat from "./Chat";

class ChatList extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("ChatList: ", props);
    // }

    // state = {};

    render() {
        return (
            <div className="chatlist">
                {this.props.chatlist.map((chat) => (
                    <Chat
                        key={chat.frnds_id}
                        data={chat}
                        onChatClick={this.props.onChatClick}
                        activeChat={this.props.activeChat}
                    />
                ))}
            </div>
        );
    }
}

export default ChatList;
