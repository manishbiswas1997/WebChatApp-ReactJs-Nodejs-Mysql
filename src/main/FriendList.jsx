import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Friend from "./Friend";

class ChatList extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("ChatList: ", props);
    // }

    // state = {};

    render() {
        return (
            <div className="friendlist">
                {this.props.friends.map((friend) => (
                    <Friend
                        key={friend.frnds_id}
                        data={friend}
                        onNewChat={this.props.onNewChat}
                        activeChat={this.props.activeChat}
                    />
                ))}
            </div>
        );
    }
}

export default ChatList;
