import React, { Component } from "react";

class Message extends Component {
    // state = {};
    // constructor(props) {
    //     super(props);
    //     console.log("called");
    // }
    alignment = () => {
        return this.props.msg.self ? "self" : "friend";
    };
    render() {
        // console.log("vv");
        return (
            <span className={`Message ${this.alignment()}`}>
                <p>{this.props.msg.value}</p>
                <span>{this.props.msg.time}</span>
            </span>
        );
    }
}

export default Message;
