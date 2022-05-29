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

instrument(wsServer,{
   auth: false
});

function publicRooms(){
   const sids = wsServer.sockets.adapter.sids;
   const rooms = wsServer.sockets.adapter.rooms;
   const publicRooms = [];
   rooms.forEach((_, key) => {
      if(sids.get(key) === undefined){
         publicRooms.push(key);
      }
   });
   return publicRooms;
}

function countRoom(roomName){
   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", socket => {
   socket["nickname"] = "Anonymous";
   socket.onAny((event) => {
      console.log(`Socket Event : ${event}`);
   })
   socket.on("enter_room", (roomName, done) => {
      socket.join(roomName);
      done();
      socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
      wsServer.sockets.emit("room_change", publicRooms());
   });
   socket.on("disconnecting", () => {
      socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
   });
   socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
   });
   socket.on("new_message", (msg, room, done) => {
      socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
      done();
   });
   socket.on("nickname", (nickname) => (socket["nickname"] = nickname))
});


server.listen(3000, handleListen);