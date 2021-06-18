import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import SimpleBackdrop from "./Backdrop";

const axios = require("axios").default;

const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1),
        },
    },
    formControl: {
        margin: theme.spacing(3),
    },
    input: {
        display: "none",
    },
}));

export default function RegistrationDialog(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [error, setError] = React.useState(false);
    const [imgerror, imgsetError] = React.useState(false);
    const [helperText, setHelperText] = React.useState("");
    const [imghelperText, imgsetHelperText] = React.useState("");

    const [openBackdrop, setOpenBackdrop] = React.useState(false);
    const BackdrophandleClose = () => {
        setOpenBackdrop(false);
    };
    const BackdrophandleOpen = () => {
        setOpenBackdrop(true);
    };

    // const classes = useStyles();

    const handleChange = (event) => {
        setValue(event.target.value);
        setError(false);
        setHelperText("");
    };

    const handleChangePhoto = (event) => {
        // setValue(event.target.value);
        imgsetError(false);
        imgsetHelperText("");
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const signUp = (name, username, password, photo, gender) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("username", username);
        formData.append("password", password);
        formData.append("photo", photo);
        formData.append("gender", gender);
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        axios
            .post(
                `http://${window.location.hostname}:3001/register`,
                formData,
                config
            )
            .then(function (response) {
                BackdrophandleClose();
                if (response.data.statusCode === 1) {
                    window.alert("You're Signed Up");
                    handleClose();
                } else if (response.data.statusCode === 1062) {
                    window.alert("Username Already Taken");
                } else {
                    window.alert("Server Error");
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    props.callback(handleClickOpen);

    const handleSubmit = (event) => {
        event.preventDefault();
        let image = document.getElementById("icon-button-file");
        let FileUploadPath = image.value;
        if (value === "male" || value === "female") {
            setError(false);
            if (FileUploadPath == "") {
                setError(false);
            } else {
                var name = image.files[0].name;
                var ext = name.split(".").pop().toLowerCase();
                if (["gif", "png", "jpg", "jpeg"].every((e) => e != ext)) {
                    imgsetError(true);
                    imgsetHelperText("Invalid Photo Type");
                    return false;
                }
                if (image.files[0].size > 3145728) {
                    imgsetError(true);
                    imgsetHelperText("Photo Size is greater than 3MB");
                    return false;
                }
                imgsetError(false);
            }
        } else {
            setHelperText("Please select an option.");
            setError(true);
            return false;
        }
        signUp(
            document.getElementById("name").value,
            document.getElementById("regUsernameText").value,
            document.getElementById("regPasswordText").value,
            document.getElementById("icon-button-file").files[0],
            value
        );
        BackdrophandleOpen();
    };
    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                BackdropComponent={SimpleBackdrop}
                BackdropProps={{
                    openBackdrop: openBackdrop,
                }}
            >
                {/* <Button
                    variant="outlined"
                    color="primary"
                    onClick={BackdrophandleToggle}
                >
                    Show backdrop
                </Button> */}
                <form onSubmit={handleSubmit}>
                    <FormControl
                        component="fieldset"
                        // error={error}
                        className={classes.formControl}
                    >
                        <DialogTitle id="form-dialog-title">SignUp</DialogTitle>
                        <DialogContent>
                            <TextField
                                inputProps={{ maxLength: 15 }}
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Name"
                                type="text"
                                fullWidth
                                required={true}
                            />
                            <TextField
                                inputProps={{ maxLength: 45 }}
                                error={false}
                                margin="dense"
                                id="regUsernameText"
                                label="Username"
                                type="text"
                                fullWidth
                                required={true}
                            />
                            <TextField
                                inputProps={{ maxLength: 20 }}
                                required={true}
                                margin="dense"
                                id="regPasswordText"
                                label="Password"
                                type="password"
                                fullWidth
                            />
                            <input
                                accept="image/*"
                                className={classes.input}
                                id="icon-button-file"
                                type="file"
                                onChange={handleChangePhoto}
                            />
                            <label htmlFor="icon-button-file">
                                Choose Profile Pic :
                                <IconButton
                                    color="primary"
                                    aria-label="upload picture"
                                    component="span"
                                >
                                    <PhotoCamera />
                                </IconButton>
                                <FormHelperText error={imgerror}>
                                    {imghelperText}
                                </FormHelperText>
                            </label>
                            <FormLabel component="legend" error={error}>
                                Gender
                            </FormLabel>
                            <RadioGroup
                                aria-label="gender"
                                name="gender1"
                                value={value}
                                onChange={handleChange}
                                required={true}
                            >
                                <FormControlLabel
                                    value="female"
                                    control={<Radio />}
                                    label="Female"
                                />
                                <FormControlLabel
                                    value="male"
                                    control={<Radio />}
                                    label="Male"
                                />
                            </RadioGroup>
                            <FormHelperText error={error}>
                                {helperText}
                            </FormHelperText>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                // onSubmit={() => {
                                //     signUp(
                                //         document.getElementById("regUsernameText")
                                //             .value,
                                //         document.getElementById("regPasswordText").value
                                //     );
                                // }}
                                color="primary"
                                type="submit"
                            >
                                Sign Up
                            </Button>
                        </DialogActions>
                    </FormControl>
                </form>
            </Dialog>
        </div>
    );
}
