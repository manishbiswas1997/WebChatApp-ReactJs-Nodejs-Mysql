import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import Request from "./Request";

class ChatList extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("ChatList: ", props);
    // }

    // state = {};

    render() {
        return (
            <div className="requestlist">
                {this.props.requestList.map((request) => (
                    <Request
                        key={request.frnds_id}
                        data={request}
                        actionFriendRequest={this.props.actionFriendRequest}
                    />
                ))}
            </div>
        );
    }
}

export default ChatList;
