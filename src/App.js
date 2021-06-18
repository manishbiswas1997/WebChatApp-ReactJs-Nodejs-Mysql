import React from "react";
// import "./App.css";
import { Route, Switch } from "react-router-dom";
import Main from "./main/Main";
import Landing from "./main/Landing";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
    return (
        <Router>
            <Switch>
                <Route exact path="/land" component={Landing} />
                <Route exact path="/" component={Main} />
            </Switch>
        </Router>
    );
}

export default App;
