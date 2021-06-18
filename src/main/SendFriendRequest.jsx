import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function FormDialog(props) {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    var input = 69;

    const fun = (event) => {
        if (event) {
            input = event;
        }
    };

    props.addHandlers(handleClickOpen);

    return (
        <div>
            {/* <Button
                variant="outlined"
                color="primary"
                onClick={handleClickOpen}
            >
                Open form dialog
            </Button> */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Send Friend Request
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ask your loved onces for their username. And paste it
                        below
                    </DialogContentText>
                    <TextField
                        inputProps={{ maxLength: 45 }}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="User Name"
                        type="email"
                        fullWidth
                        inputRef={fun}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            props.sendFriendRequest(input.value);
                            handleClose();
                        }}
                        color="primary"
                    >
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
