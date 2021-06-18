import React from "react";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import Cookies from "js-cookie";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
    },
});

const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

const NavBar = (props) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <div className="navigation" style={props.style}>
                <h5 className="appName">ChattApp</h5>
                <div className="userContainer">
                    <PersonAddIcon
                        style={{ fontSize: 30 }}
                        className="sendRequestButton"
                        onClick={props.handleSendFrndReqst}
                    />
                    <div
                        className="user"
                        style={{ display: props.mobView ? "none" : "flex" }}
                    >
                        <img
                            className="img"
                            src={`http://${
                                window.location.hostname
                            }:3001/uploads/${Cookies.get("pic")}`}
                            alt=""
                        />
                        <div>
                            <h5>{Cookies.get("name")}</h5>
                            <p>user : {Cookies.get("username") + " "}</p>
                            <button onClick={props.logout}>Logout</button>
                        </div>
                    </div>
                    <MoreVertIcon
                        style={{
                            fontSize: 30,
                            display: props.mobView ? "block" : "none",
                        }}
                        className="userVert"
                        onClick={handleClickOpen}
                    />
                </div>
            </div>
            <div>
                {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleClickOpen}
                >
                    Open dialog
                </Button> */}
                <Dialog
                    onClose={handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={open}
                >
                    <DialogTitle
                        id="customized-dialog-title"
                        onClose={handleClose}
                    >
                        <div className="mobileDialogBox">
                            <img
                                className="img"
                                src={`http://${
                                    window.location.hostname
                                }:3001/uploads/${Cookies.get("pic")}`}
                                alt=""
                            />
                            {Cookies.get("name")}
                        </div>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>
                            user : {Cookies.get("username") + " "}
                        </Typography>
                        <Typography gutterBottom>
                            Made with Love for you
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="outlined"
                            onClick={props.logout}
                            color="secondary"
                        >
                            Logout
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </React.Fragment>
    );
};

export default NavBar;
