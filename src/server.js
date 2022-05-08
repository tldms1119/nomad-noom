import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views/");
app.use("/public", express.static(__dirname + "/public")); // home.pug 에서 script js 를 불러오기 위한 정적 파일 추가
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http:localhost:3000 `);

// 같은 서버 내에서 http, webSocket 서버를 둘다 작동시키는 코드
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

// browser 간 통신을 위해 소켓 배열 저장
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser");
    socket.on("close", () => {
        console.log("Disconnected from the Browser");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message" :
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));
            case "nickname" :
                socket["nickname"] = message.payload; // socket 자체는 object 이므로 새로운 필드 세팅 가능
        }
    });
});

server.listen(3000, handleListen);