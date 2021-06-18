import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.css";
import RegistrationDialog from "./RegistrationDialog";
import Cookies from "js-cookie";
import axios from "axios";
import { Redirect } from "react-router-dom";

class Landing extends Component {
    state = {
        handleRegOpen: undefined,
        Redirect: null,
    };

    regOpenCallback = (def) => {
        this.handleRegOpen = def;
    };

    // mockLogin = () => {
    //     Cookies.set("token", "awesome", { expires: 86400, path: "/" });
    //     Cookies.set("username", document.getElementById("usernameText").value, {
    //         expires: 86400,
    //         path: "/",
    //     });
    //     this.props.history.push("/");
    // };

    login = (username, password) => {
        return new Promise((resolve, reject) => {
            axios
                .post(`http://${window.location.hostname}:3001/login`, {
                    username: username,
                    password: password,
                })
                .then(function (response) {
                    // console.log(response.data);
                    if (response.data.statusCode === 1) {
                        resolve(response.data);
                    } else {
                        console.log("incorrect");
                        reject("Incorrect Username or Password");
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    reject("Error Occured");
                });
        });
    };

    loginPromise = async (username, password) => {
        try {
            let data = await this.login(username, password);
            Cookies.set("token", data.token, { expires: 86400, path: "/" });
            Cookies.set("username", data.username, {
                expires: 86400,
                path: "/",
            });
            Cookies.set("id", data.id, { expires: 86400, path: "/" });
            Cookies.set("name", data.name, { expires: 86400, path: "/" });
            Cookies.set("pic", data.pic, { expires: 86400, path: "/" });
            // this.props.history.push("/");
            this.setState({ Redirect: "/" });
        } catch (msg) {
            window.alert(msg);
        }
    };

    render() {
        // console.log(this.props.st);
        if (this.state.Redirect) {
            return (
                <Redirect
                    to={this.state.Redirect}
                    // st={this.state}
                    // nam={"manish"}
                />
            );
        }
        return (
            <div className="conatiner">
                <div
                    className="container-fluid"
                    style={{ textAlign: "center", marginTop: "20vh" }}
                >
                    <h1>Chat App</h1>
                    <div>
                        <div>
                            <input
                                id="usernameText"
                                type="text"
                                placeholder="Username"
                                maxLength="45"
                            />
                        </div>
                        <div style={{ margin: "10px" }}>
                            <input
                                id="passwordText"
                                type="password"
                                placeholder="Password"
                                maxLength="20"
                            />
                        </div>
                        <button
                            className="btn btn-outline-success"
                            onClick={() => {
                                this.loginPromise(
                                    document.getElementById("usernameText")
                                        .value,
                                    document.getElementById("passwordText")
                                        .value
                                );
                            }}
                        >
                            Login
                        </button>
                        <p style={{ marginTop: "20px" }}>
                            New user?{" "}
                            <a
                                href="#"
                                onClick={this.state.handleRegOpen}
                                data-toggle="modal"
                                data-target="#exampleModalCenter"
                            >
                                Register
                            </a>{" "}
                            Now
                        </p>
                    </div>
                </div>
                <RegistrationDialog callback={this.regOpenCallback} />
            </div>
        );
    }

    componentDidMount() {
        this.setState({ handleRegOpen: this.handleRegOpen });
    }
}

export default Landing;
