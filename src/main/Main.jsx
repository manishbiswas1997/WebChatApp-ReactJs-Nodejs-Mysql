import React, { Component } from "react";
import ChatList from "./ChatList";
import FriendList from "./FriendList";
import RequestList from "./RequestList";
import Cookies from "js-cookie";
import socketIOClient from "socket.io-client";
import { Redirect } from "react-router-dom";
import ChatWindow from "../chatwindow/ChatWindow";
import NavBar from "./NavBar";
import "../css/main.css";
import SendFriendRequest from "./SendFriendRequest";

class Main extends Component {
    // constructor(props) {
    //     super(props);
    //     // console.log("Main: ", props);
    // }
    mediaQuery = {
        desktop: 1200,
        tablet: 880,
        phone: 576,
    };
    months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    state = {
        initiate: false,
        socket: null,
        windowWidth: null,
        handleSendFrndReqst: null,
        endpoint: `http://${window.location.hostname}:3001`,
        Redirect: null,
        selectedTab: "chats",
        activeChat: null,
        chatList: [],
        friends: [],
        requestList: [],
        chats: {},
    };
    onChatClick = (frnds_id) => {
        // console.log("gulu" + frnds_id);
        let current_id = this.state.activeChat;
        if (current_id) {
            let chats = { ...this.state.chats };
            chats[current_id] = { ...chats[current_id] };
            // chats[current_id].msges = [...chats[current_id].msges];
            chats[current_id].textValue = this.TextInput.value;
            // console.log(chats[current_id], this.state.chats[current_id]);
            // this.state.chats[current_id].textValue = this.TextInput.value;
            this.TextInput.value = this.state.chats[frnds_id].textValue;
            this.setState({ chats: chats, activeChat: frnds_id }, () => {
                this.TextInput.addEventListener("keypress", this.onKeyPress);
                this.scrollChatboxToBottom();
                if (this.state.windowWidth > this.mediaQuery.tablet)
                    this.TextInput.focus();
            });
        } else
            this.setState({ activeChat: frnds_id }, () => {
                this.TextInput.addEventListener("keypress", this.onKeyPress);
                this.scrollChatboxToBottom();
                if (this.state.windowWidth > this.mediaQuery.tablet)
                    this.TextInput.focus();
            });
    };
    addHandlers = (event) => {
        this.reqsthandlers = event;
    };

    // componentDidUpdate() {
    //     if (this.state.activeChat) {
    //         // this.TextInput.focus();
    //         this.TextInput.addEventListener("keypress", this.onKeyPress);
    //         // this.scrollChatboxToBottom();
    //     }
    // }

    componentDidMount() {
        const { endpoint } = this.state;

        if (Cookies.get("token")) {
            this.setState(
                {
                    socket: socketIOClient(endpoint, {
                        query: { token: Cookies.get("token") },
                    }),
                    handleSendFrndReqst: this.reqsthandlers,
                    windowWidth: document.body.clientWidth,
                },
                () => {
                    this.state.socket.on("connect", () =>
                        console.log("connected")
                    );
                    this.state.socket.on("error", (err) => {
                        this.logout();
                        console.log(err);
                    });
                    this.state.socket.on("initiateClient", (state) => {
                        if (this.state.initiate) return;
                        const {
                            chatList,
                            friends,
                            chats,
                            requestList,
                        } = JSON.parse(state);
                        this.setState({
                            initiate: true,
                            chatList,
                            friends,
                            chats,
                            requestList,
                        });
                    });
                    this.state.socket.on("RequestStatus", (message) => {
                        alert(message);
                    });
                    this.state.socket.on("deleteRequest", (requestId) => {
                        console.log(requestId);
                        const requestList = this.state.requestList.filter(
                            (request) => request.frnds_id !== requestId
                        );
                        this.setState({ requestList });
                    });
                    this.state.socket.on("addNewFriend", (data) => {
                        data = JSON.parse(data);
                        let status = false;
                        const requestList = this.state.requestList.filter(
                            (request) => {
                                if (request.frnds_id !== data.frnds_id)
                                    return true;
                                else {
                                    status = [request];
                                    return false;
                                }
                            }
                        );
                        let friends = [...this.state.friends];
                        if (status) {
                            // let requestList = [...this.state.requestList];
                            friends = status.concat(friends);
                            this.setState({ friends, requestList });
                        } else {
                            const newFriend = [data];
                            friends = newFriend.concat(friends);
                            this.setState({ friends });
                        }
                    });
                    this.state.socket.on("newFriendRequest", (data) => {
                        data = JSON.parse(data);
                        console.log(data);
                        let requestList = [...this.state.requestList];

                        const newRequest = [
                            {
                                frnds_id: data.reqstId,
                                username: data.reqstUsername,
                                name: data.reqstName,
                                pic: data.pic,
                            },
                        ];
                        requestList = newRequest.concat(requestList);
                        this.setState({ requestList });
                    });
                    this.state.socket.on("newTextMessage", (data) => {
                        data = JSON.parse(data);
                        // console.log("newwwww", data, this.state);
                        if (data.target_id in this.state.chats) {
                            let chats = { ...this.state.chats };
                            chats[data.target_id] = {
                                ...chats[data.target_id],
                            };
                            chats[data.target_id].msges = [
                                ...chats[data.target_id].msges,
                            ];
                            const newMsg = [
                                {
                                    id: data.msgId,
                                    value: data.msg,
                                    self: false,
                                    date: data.date,
                                    time: data.time,
                                },
                            ];
                            chats[data.target_id].msges = chats[
                                data.target_id
                            ].msges.concat(newMsg);

                            // const msges = [...this.state.msges];
                            // const newMsg = [{ value: data, self: false }];
                            this.setState({ chats }, () => {
                                if (this.state.activeChat === data.target_id)
                                    this.scrollChatboxToBottom();
                            });
                        } else {
                            let chats = { ...this.state.chats };
                            const frnd = this.state.friends.find((frnd) => {
                                return frnd.frnds_id === data.target_id;
                            });
                            chats[data.target_id] = {
                                name: frnd.name,
                                msges: [
                                    {
                                        value: data.msg,
                                        self: false,
                                        date: data.date,
                                        time: data.time,
                                    },
                                ],
                                textValue: "",
                                counter: 0,
                                pic: frnd.pic,
                            };
                            // this.state.chatList
                            let chatList = [...this.state.chatList];
                            const newchat = [
                                {
                                    frnds_id: data.target_id,
                                    name: frnd.name,
                                    pic: frnd.pic,
                                },
                            ];
                            chatList = newchat.concat(chatList);
                            // this.setState({ chats, chatList }, () => {
                            //     this.scrollChatboxToBottom();
                            // });
                            this.setState({ chats, chatList });
                        }
                    });
                }
            );
        } else this.setState({ Redirect: "/land" });
        window.addEventListener("resize", () => {
            this.setState({ windowWidth: document.body.clientWidth });
        });
    }
    logout = () => {
        Cookies.remove("token");
        Cookies.remove("username");
        Cookies.remove("id");
        if (this.state.socket.connected) this.state.socket.disconnect();
        // this.props.history.push(`/`);
        this.setState({ Redirect: "/land" });
    };
    scrollChatboxToBottom = () => {
        this.ChatBox.scrollTop = this.ChatBox.scrollHeight;
    };
    addElement = (elem) => {
        // console.log("mewww");
        // console.log(elem.className);
        if (elem) this[elem.className] = elem;
        // this.chatBox = elem;
    };
    onNewChat = (frnds_id, name, pic) => {
        // const hasChat = this.state.chatList.some(frnd => frnd.frnds_id == frnds_id);
        const hasChat = frnds_id in this.state.chats;
        if (hasChat) this.onChatClick(frnds_id);
        else {
            let chats = { ...this.state.chats };
            let current_id = this.state.activeChat;
            // const frnd = this.state.friends.find((frnd) => {
            //     return frnd.frnds_id == data.target_id;
            // });
            chats[frnds_id] = {
                name: name,
                pic: pic,
                msges: [],
                textValue: "",
                counter: 0,
            };
            if (current_id) {
                chats[current_id] = { ...chats[current_id] };
                // chats[current_id].msges = [...chats[current_id].msges];
                chats[current_id].textValue = this.TextInput.value;
                // this.TextInput.value = this.state.chats[frnds_id].textValue;
                this.TextInput.value = "";
            }
            this.setState({ chats: chats, activeChat: frnds_id }, () => {
                this.TextInput.addEventListener("keypress", this.onKeyPress);
                this.scrollChatboxToBottom();
                if (this.state.windowWidth > this.mediaQuery.tablet)
                    this.TextInput.focus();
            });
            // this.state.chatList
            // let chatList = [...this.state.chatList];
            // const newchat = [
            //     { frnds_id: frnds_id, name: name },
            // ];
            // chatList = newchat.concat(chatList);
            // this.setState({ chats, chatList }, () => {
            //     this.scrollChatboxToBottom();
            // });
            // this.setState({ chats, chatList });
        }
    };
    getTime = (datetime) => {
        let hours = datetime.getHours();
        let minutes = datetime.getMinutes();
        let ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? "0" + minutes : minutes;
        const strTime = hours + ":" + minutes + " " + ampm;
        return strTime;
    };
    getDate = (datetime) => {
        let date = datetime.getDate();
        let month = this.months[datetime.getMonth()];
        let year = datetime.getFullYear();
        const strDate = date + " " + month + " " + year;
        return strDate;
    };
    send = () => {
        if (this.TextInput.value === "") {
            this.TextInput.focus();
            return;
        }
        let current_id = this.state.activeChat;
        let chats = { ...this.state.chats };
        chats[current_id] = { ...chats[current_id] };
        chats[current_id].msges = [...chats[current_id].msges];
        let nextid = (chats[current_id].counter =
            chats[current_id].counter + 1);
        // let newid = tmp[tmp.length - 1].id + 1;
        const curTime = new Date();
        const newMsg = [
            {
                id: nextid,
                value: this.TextInput.value,
                self: true,
                date: this.getDate(curTime),
                time: this.getTime(curTime),
            },
        ];
        // console.log(newMsg);
        chats[current_id].msges = chats[current_id].msges.concat(newMsg);
        // const msges = [...this.state.msges];
        // console.log(chats, this.state.chats);
        let data = JSON.stringify({
            target_id: current_id,
            msg: this.TextInput.value,
            msgId: nextid,
        });
        this.TextInput.value = "";
        // console.log(data);
        // if (this.state.socket.connected)
        this.state.socket.emit("clientTextMessage", data);

        const hasChat = this.state.chatList.some(
            (frnd) => frnd.frnds_id === current_id
        );
        if (hasChat)
            this.setState({ chats }, () => {
                this.scrollChatboxToBottom();
                this.TextInput.focus();
            });
        else {
            let chatList = [...this.state.chatList];
            const frndinfo = this.state.friends.find(
                (frnd) => frnd.frnds_id === current_id
            );
            // console.log(frndinfo);
            const newchat = [
                {
                    frnds_id: current_id,
                    name: frndinfo.name,
                    pic: frndinfo.pic,
                },
            ];
            chatList = newchat.concat(chatList);
            this.setState({ chatList, chats }, () => {
                this.scrollChatboxToBottom();
                this.TextInput.focus();
            });
        }
    };
    onKeyPress = (event) => {
        // console.log("key Pressed", event);
        if (
            event.keyCode === 13 &&
            event.shiftKey === false &&
            this.state.windowWidth > this.mediaQuery.tablet
        ) {
            event.preventDefault();
            this.send();
        }
    };
    window() {
        // console.log("hus");
        if (this.state.activeChat)
            return (
                <ChatWindow
                    chat={this.state.chats[this.state.activeChat]}
                    addElement={this.addElement}
                    send={this.send}
                    back={this.back}
                    activeBack={this.state.windowWidth < this.mediaQuery.tablet}
                />
            );
        return <div>Chat Window</div>;
    }
    sendFriendRequest = (reqstUsername) => {
        console.log(reqstUsername);
        this.state.socket.emit("sendFriendRequest", reqstUsername);
    };
    actionFriendRequest = (id, action) => {
        console.log(id, action);
        this.state.socket.emit(
            "ActionRequest",
            JSON.stringify({
                id: id,
                action: action,
            })
        );
    };
    selectTab = (tab) => {
        this.setState({ selectedTab: tab });
    };
    isactive = (tab) => {
        return this.state.selectedTab === tab ? "active" : "";
    };
    tabContent = () => {
        switch (this.state.selectedTab) {
            case "chats":
                return (
                    <ChatList
                        history={this.props.history}
                        chatlist={this.state.chatList}
                        onChatClick={this.onChatClick}
                        activeChat={this.state.activeChat}
                    />
                );
            case "friends":
                return (
                    <FriendList
                        history={this.props.history}
                        friends={this.state.friends}
                        onNewChat={this.onNewChat}
                        activeChat={this.state.activeChat}
                    />
                );
            case "requests":
                return (
                    <RequestList
                        history={this.props.history}
                        requestList={this.state.requestList}
                        actionFriendRequest={this.actionFriendRequest}
                    />
                );
            default:
                console.log("error in switch Case");
        }
    };
    back = () => {
        this.setState({ activeChat: null });
    };
    windowStyle = () => {
        // console.log(this.state.windowWidth);
        if (this.state.windowWidth <= this.mediaQuery.tablet) {
            return {
                display: this.state.activeChat ? "block" : "none",
            };
        }
    };
    friendsContainerStyle = () => {
        if (this.state.windowWidth <= this.mediaQuery.tablet) {
            return {
                display: this.state.activeChat ? "none" : "grid",
            };
        }
    };
    showNavbar = () => {
        if (
            this.state.windowWidth <= this.mediaQuery.tablet &&
            this.state.activeChat
        )
            return {
                display: "none",
            };
        else
            return {
                display: "flex",
            };
    };
    mainContainerStyle = () => {
        if (
            this.state.windowWidth <= this.mediaQuery.tablet &&
            this.state.activeChat
        )
            return {
                height: "100%",
            };
        else
            return {
                height: "",
            };
    };

    render() {
        // console.log(this.props.nam);
        // console.log(this.props.st);
        if (this.state.Redirect) {
            // console.log("gulu");
            return <Redirect to={this.state.Redirect} st={this.state} />;
        }
        // console.log("sorbonash");
        return (
            <div className="primaryContainer">
                {/* <img
                    src={`http://${window.location.hostname}:3001/Koala.jpg`}
                    alt=""
                /> */}
                <SendFriendRequest
                    sendFriendRequest={this.sendFriendRequest}
                    addHandlers={this.addHandlers}
                />
                <div className="outerDiv">
                    <NavBar
                        style={this.showNavbar()}
                        handleSendFrndReqst={this.state.handleSendFrndReqst}
                        logout={this.logout}
                        mobView={
                            this.state.windowWidth <= this.mediaQuery.tablet
                        }
                    />
                    <div
                        className="mainContainer"
                        style={this.mainContainerStyle()}
                    >
                        <div
                            className="friendsContainer"
                            style={this.friendsContainerStyle()}
                        >
                            <div className="tabContainer">
                                <button
                                    className={
                                        "tablinks " + this.isactive("chats")
                                    }
                                    onClick={() => this.selectTab("chats")}
                                >
                                    Chats
                                </button>
                                <button
                                    className={
                                        "tablinks " + this.isactive("friends")
                                    }
                                    onClick={() => this.selectTab("friends")}
                                >
                                    Friends
                                </button>
                                <button
                                    className={
                                        "tablinks " + this.isactive("requests")
                                    }
                                    onClick={() => this.selectTab("requests")}
                                >
                                    Requests
                                </button>
                            </div>
                            {this.tabContent()}
                        </div>
                        <div className="window" style={this.windowStyle()}>
                            {this.window()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Main;
