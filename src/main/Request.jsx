import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { faUserTimes } from "@fortawesome/free-solid-svg-icons";
class Chat extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("Chat props: ", props);
    // }
    // state = {};
    render() {
        return (
            <div className="listNames">
                <img
                    className="img"
                    src={`http://${window.location.hostname}:3001/uploads/${this.props.data.pic}`}
                    alt=""
                />
                <div className="rqstcontainer">
                    <h5>{this.props.data.username}</h5>
                    <div className="requestBox">
                        <FontAwesomeIcon
                            icon={faUserCheck}
                            className="accept"
                            onClick={() =>
                                this.props.actionFriendRequest(
                                    this.props.data.frnds_id,
                                    true
                                )
                            }
                        />
                        <FontAwesomeIcon
                            icon={faUserTimes}
                            className="delete"
                            onClick={() =>
                                this.props.actionFriendRequest(
                                    this.props.data.frnds_id,
                                    false
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;
