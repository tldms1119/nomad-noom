import http from "http";
import { Server } from "socket.io";
import express from "express";
import {instrument} from "@socket.io/admin-ui";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views/");
app.use("/public", express.static(__dirname + "/public")); // home.pug 에서 script js 를 불러오기 위한 정적 파일 추가
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http:localhost:3000 `);

// 같은 서버 내에서 http, webSocket 서버를 둘다 작동시키는 코드
const server = http.createServer(app);
const wsServer = new Server(server,{
   cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
   }
});

wsServer.on("connection", socket => {
   socket.onAny((event) => {
      console.log(`Socket Event : ${event}`);
   });
   socket.on("join_room", (roomName, done) => {
      socket.join(roomName);
      done();
      socket.to(roomName).emit("welcome");
   })
});


server.listen(3000, handleListen);

// why 