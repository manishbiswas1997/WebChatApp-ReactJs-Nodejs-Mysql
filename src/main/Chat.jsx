import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
class Chat extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("Chat props: ", props);
    // }
    // state = {};
    isactive = () => {
        // console.log(this.props.data.frnds_id, this.props.activeChat);
        return this.props.data.frnds_id === this.props.activeChat
            ? "activeChat"
            : "";
    };
    render() {
        return (
            <div
                className={"listNames " + this.isactive()}
                onClick={(event) =>
                    this.props.onChatClick(this.props.data.frnds_id)
                }
            >
                <img
                    className="img"
                    src={`http://${window.location.hostname}:3001/uploads/${this.props.data.pic}`}
                    alt=""
                />
                <div className="chatContainer">
                    <h5>{this.props.data.name}</h5>
                </div>
                {/* <p>{this.props.data.lastMsg}</p> */}
            </div>
        );
    }
}

export default Chat;
