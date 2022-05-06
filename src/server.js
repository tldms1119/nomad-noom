import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/public/views/");
app.use("/public", express.static(__dirname + "/public")); // home.pug 에서 script js 를 불러오기 위한 정적 파일 추가
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http:localhost:3000 `);
app.listen(3000, handleListen);