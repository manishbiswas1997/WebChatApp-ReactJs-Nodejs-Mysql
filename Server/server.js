const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
// const fileUpload = require("express-fileupload");
const multer = require("multer");
// var upload = multer();

const port = 3001;

let app = express();
let server = http.createServer(app); //proxy Server for socket.io
let io = socketIO(server);

app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(fileUpload());
// app.use(upload.array());

app.all("/*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// app.get("/", function (req, res) {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
// });
// app.get("/land", function (req, res) {
//     res.sendFile(path.join(__dirname, "build", "index.html"));
// });

const jwtSecret = "example";
let client_Sockets = {};
const months = [
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
    let month = months[datetime.getMonth()];
    let year = datetime.getFullYear();
    const strDate = date + " " + month + " " + year;
    return strDate;
};

io.use((socket, next) => {
    // console.log("called");
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, "example", function (
            err,
            decoded
        ) {
            if (err) return next(new Error("Authentication error"));
            //   socket.decoded = decoded;
            client_Sockets[decoded.userId] = socket;
            console.log();
            console.log("New Socket Connected : ");
            console.log(decoded);
            socket.id = decoded.userId;
            next();
        });
    } else {
        next(new Error("Authentication error"));
    }
});
const db_config = {
    connectionLimit: 10,

    // host: "remotemysql.com",
    // user: "01X2vHlp3v",
    // password: "KTeabwZyZJ",
    // database: "01X2vHlp3v",

    // host: "sql12.freesqldatabase.com",
    // user: "sql12348052",
    // password: "1qLAqgT48q",
    // database: "sql12348052",

    host: "localhost",
    user: "root",
    password: "1234", //Black@123
    database: "mychatapp",
};
var pool = mysql.createPool(db_config);

const poolConnectionPromise = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err);
            else {
                // console.log("DataBase Connected");
                resolve(connection);
            }
        });
    });
};
const queryPromise = (connection, query) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results, fields) => {
            if (err) reject(err);
            else resolve({ results, fields });
        });
    });
};

async function initiateClient(connection, socket) {
    let state = {
        chatList: [],
        friends: [],
        requestList: [],
        chats: {},
    };
    let records = await queryPromise(
        connection,
        `SELECT id, isFriend, hasChat, name, username, pic FROM id_${socket.id} INNER JOIN user ON id_${socket.id}.FriendRequest_IDs=user.id`
    );
    state.requestList = records.results
        .filter((frnd) => !frnd.isFriend)
        .map((frnd) => {
            return {
                frnds_id: frnd.id,
                name: frnd.name,
                username: frnd.username,
                pic: frnd.pic,
            };
        });
    state.friends = records.results
        .filter((frnd) => frnd.isFriend)
        .map((frnd) => {
            return {
                frnds_id: frnd.id,
                name: frnd.name,
                pic: frnd.pic,
            };
        });
    state.chatList = records.results
        .filter((frnd) => frnd.hasChat)
        .map((frnd) => {
            return {
                frnds_id: frnd.id,
                name: frnd.name,
                pic: frnd.pic,
            };
        });
    if (state.chatList.length > 0) {
        let chatTable;
        for (row of state.chatList) {
            chatTable = [socket.id, row.frnds_id];
            chatTable.sort();

            let chats = await queryPromise(
                connection,
                "SELECT * FROM `chat_" +
                    chatTable[0] +
                    "_&_" +
                    chatTable[1] +
                    "`"
            );
            let msgCounter = 0;
            state.chats[row.frnds_id] = {
                name: row.name,
                pic: row.pic,
                msges: chats.results.map((msg) => {
                    if (socket.id == msg.sender) msgCounter = msg.id;
                    return {
                        id: msg.id,
                        value: msg.message,
                        self: socket.id == msg.sender,
                        date: msg.date,
                        time: msg.time,
                    };
                }),
                counter: msgCounter,
                textValue: "",
            };
        }
    }
    connection.release();
    //api send here
    // console.log(state);
    socket.emit("initiateClient", JSON.stringify(state));
}

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "P-" + uniqueSuffix + path.extname(file.originalname));
        // cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 3145728 }, //3MB
}).single("photo");

// function StartService() {

// connection.on("error", function (err) {
//     console.log(err);
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//         console.log("PROTOCOL_CONNECTION_LOST", "Reconnecting...");
//         // setTimeout(StartService, 2000);
//         connection.end();
//         connection.destroy();
//         StartService();
//         // Connection to the MySQL server is usually
//         //   handleDisconnect();                         // lost due to either server restart, or a
//         // reject(err);
//     } else {
//         console.log("another error"); // connnection idle timeout (the wait_timeout
//         throw err; // server variable configures this)
//     }
// });

// initiateClient(connection, { id: 33 });
// app.post("/test", upload, (req, res, err) => {
//     console.log("Request ---", req.body.user);
//     console.log("Request file ---", req.file); //Here you get file.
//     /*Now do where ever you want to do*/
//     if (!err) return res.send(200).end();
// });
app.post("/register", upload, async (req, res) => {
    let resBody = { statusCode: 0 };
    // console.log(req.file);
    try {
        var connection = await poolConnectionPromise();
        let picname;
        if (typeof req.file != "undefined") picname = `'${req.file.filename}'`;
        else picname = `'${req.body.gender}.png'`;

        let queryResult = await queryPromise(
            connection,
            `INSERT INTO user(name, username, password, gender, pic) VALUES('${
                req.body.name
            }','${req.body.username.toLowerCase()}', '${req.body.password}', '${
                req.body.gender
            }', ${picname})`
        );
        await queryPromise(
            connection,
            `CREATE TABLE id_${queryResult.results.insertId} (
                            FriendRequest_IDs INT NOT NULL,
                            isFriend TINYINT NOT NULL,
                            hasChat TINYINT NOT NULL,
                            PRIMARY KEY (FriendRequest_IDs),
                            FOREIGN KEY (FriendRequest_IDs) REFERENCES user (id))`
        );
        connection.release();
        resBody.statusCode = 1;
        resBody.data = queryResult.results.insertId;
        res.send(resBody);
    } catch (err) {
        // console.log(err);
        if (typeof connection != "undefined") connection.release();
        resBody.statusCode = err.errno;
        res.send(resBody);
    }
});

app.post("/login", async (req, res) => {
    let resBody = { statusCode: 0 };
    try {
        var connection = await poolConnectionPromise();
        let queryResult = await queryPromise(
            connection,
            `SELECT * FROM user WHERE username='${req.body.username}' AND password='${req.body.password}'`
        );
        connection.release();
        if (queryResult.results.length == 1) {
            //form token
            resBody.token = jwt.sign(
                {
                    userId: queryResult.results[0].id,
                },
                jwtSecret,
                {
                    algorithm: "HS512",
                    expiresIn: "30d",
                }
            );
            // await queryPromise(
            //     `INSERT INTO authentication(id, Token) VALUES('${queryResult.results[0].id}', '${resBody.token}')`
            // );
            resBody.username = queryResult.results[0].username;
            resBody.name = queryResult.results[0].name;
            resBody.pic = queryResult.results[0].pic;
            resBody.id = queryResult.results[0].id;
            resBody.statusCode = 1;
        } else {
            resBody.msg = "Incorrect Username or Password";
        }
        res.send(resBody);
    } catch (err) {
        if (typeof connection != "undefined") connection.release();
        console.log(err);
        res.send(resBody);
    }
});
io.on("connection", async (socket) => {
    // console.log("New user connected");
    try {
        var connection = await poolConnectionPromise();
        initiateClient(connection, socket);
    } catch (err) {
        if (typeof connection != "undefined") connection.release();
        console.log(err);
    }

    // poolConnectionPromise()
    //     .then((connection) => initiateClient(connection, socket))
    //     .catch((err) => {
    //         if (typeof connection != "undefined") connection.release();
    //         console.log(err);
    //     });

    socket.on("clientTextMessage", async (data) => {
        const message = JSON.parse(data);
        let chatTable = [socket.id, message.target_id];
        chatTable.sort();

        try {
            var connection = await poolConnectionPromise();
            let checks = await queryPromise(
                connection,
                `SELECT hasChat FROM id_${socket.id} where FriendRequest_IDs = ${message.target_id} and isFriend = true`
            );
            if (checks.results.length == 1) {
                if (checks.results[0].hasChat == false) {
                    checks = await queryPromise(
                        connection,
                        `UPDATE id_${message.target_id} SET hasChat = true, isFriend = true WHERE FriendRequest_IDs=${socket.id};`
                    );
                    if (checks.results.affectedRows != 1)
                        throw "Data Inconstancy!!";
                    await queryPromise(
                        connection,
                        `UPDATE id_${socket.id} SET hasChat = true, isFriend = true WHERE FriendRequest_IDs=${message.target_id};`
                    );
                    try {
                        await queryPromise(
                            connection,
                            "CREATE TABLE `chat_" +
                                chatTable[0] +
                                "_&_" +
                                chatTable[1] +
                                "`" +
                                `(
                                            sr INT NOT NULL AUTO_INCREMENT,
                                            id INT NOT NULL,
                                            message LONGTEXT NOT NULL,
                                            sender INT NOT NULL,
                                            time VARCHAR(15) NOT NULL,
                                            date VARCHAR(15) NOT NULL,
                                            PRIMARY KEY (sr),
                                            FOREIGN KEY (sender) REFERENCES user(id),
                                            UNIQUE (id,sender))`
                        );
                    } catch (err) {
                        console.log(err);
                    }
                }
                const curTime = new Date();
                const date = getDate(curTime);
                const time = getTime(curTime);
                await queryPromise(
                    connection,
                    "insert into `chat_" +
                        chatTable[0] +
                        "_&_" +
                        chatTable[1] +
                        "`(id, message, sender, time, date) values " +
                        `(${message.msgId}, ${connection.escape(
                            message.msg
                        )}, ${socket.id}, '${time}', '${date}')`
                );

                const newMessage = {
                    target_id: socket.id,
                    msg: message.msg,
                    msgId: message.msgId,
                    date: date,
                    time: time,
                };
                // console.log(message);

                if (message.target_id in client_Sockets) {
                    client_Sockets[message.target_id].emit(
                        "newTextMessage",
                        JSON.stringify(newMessage)
                    );
                }
            }
            connection.release();
        } catch (err) {
            if (typeof connection != "undefined") connection.release();
            console.log(err);
        }
    });

    socket.on("sendFriendRequest", async (reqstUsername) => {
        // console.log(reqstUsername);
        try {
            var connection = await poolConnectionPromise();
            let user_id = await queryPromise(
                connection,
                `SELECT id, username, name, pic FROM user where username='${reqstUsername}' or id=${socket.id}`
            );
            if (user_id.results.length == 2) {
                const requested_id = user_id.results.find(
                    (row) => row.username == reqstUsername.toLowerCase()
                ).id;
                const request = user_id.results.find(
                    (row) => row.id == socket.id
                );
                const checks = await queryPromise(
                    connection,
                    `SELECT FriendRequest_IDs FROM id_${socket.id} where FriendRequest_IDs=${requested_id} union SELECT FriendRequest_IDs FROM id_${requested_id} where FriendRequest_IDs=${socket.id}`
                );
                if (checks.results.length == 0) {
                    await queryPromise(
                        connection,
                        `insert into id_${requested_id}(FriendRequest_IDs, isFriend, hasChat) values (${socket.id}, false, false)`
                    );
                    if (requested_id in client_Sockets) {
                        client_Sockets[requested_id].emit(
                            "newFriendRequest",
                            JSON.stringify({
                                reqstId: socket.id,
                                reqstUsername: request.username,
                                reqstName: request.name,
                                pic: request.pic,
                            })
                        );
                    }
                    // console.log(user_id, requested_id, request_name);
                    socket.emit("RequestStatus", "sent");
                } else socket.emit("RequestStatus", "Name already exists");
            } else {
                socket.emit("RequestStatus", "Invalid Request");
            }
            connection.release();
        } catch (errorMsg) {
            if (typeof connection != "undefined") connection.release();
            console.log("Friend Request Send Error : ");
            console.log(errorMsg);
        }
    });

    socket.on("ActionRequest", async (request) => {
        request = JSON.parse(request);
        // console.log(request);
        if (request.action) {
            try {
                var connection = await poolConnectionPromise();
                const socketClientname = await queryPromise(
                    connection,
                    `SELECT name, pic FROM user where id=${socket.id}`
                );
                const rows = await queryPromise(
                    connection,
                    `UPDATE id_${socket.id} SET isFRIEND = true WHERE FriendRequest_IDs=${request.id};`
                );
                if (rows.results.affectedRows == 1) {
                    try {
                        await queryPromise(
                            connection,
                            `insert into id_${request.id}(FriendRequest_IDs, isFriend, hasChat) values (${socket.id}, true, false)`
                        );
                    } catch (err) {
                        await queryPromise(
                            connection,
                            `UPDATE id_${request.id} SET isFRIEND = true WHERE FriendRequest_IDs=${socket.id};`
                        );
                    }
                    socket.emit(
                        "addNewFriend",
                        JSON.stringify({
                            frnds_id: request.id,
                        })
                    );
                    if (request.id in client_Sockets) {
                        client_Sockets[request.id].emit(
                            "addNewFriend",
                            JSON.stringify({
                                frnds_id: socket.id,
                                name: socketClientname.results[0].name,
                                pic: socketClientname.results[0].pic,
                            })
                        );
                    }
                } else throw "No Rows Found";
                connection.release();
            } catch (err) {
                if (typeof connection != "undefined") connection.release();
                console.log(err);
            }
        } else {
            try {
                var connection = await poolConnectionPromise();
                await queryPromise(
                    connection,
                    `DELETE FROM  id_${socket.id} WHERE FriendRequest_IDs = ${request.id} and isFriend = false`
                );
                connection.release();
                socket.emit("deleteRequest", request.id);
            } catch (err) {
                if (typeof connection != "undefined") connection.release();
                console.log(err);
            }
        }
    });

    socket.on("disconnect", () => {
        delete client_Sockets[socket.id];
        console.log();
        console.log(`Socket disconnected : id ${socket.id}`);
    });
    // setInterval(() => socket.emit("serverMessage", "Hello Vai"), 4000);
});

// }
// StartService();

server.listen(port, () => {
    console.log(`Server Listening at : ${port}`);
});
