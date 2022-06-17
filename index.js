require("dotenv").config();
const express = require("express");
const user = require("./server/routes/user_route");
const app = express();
const cors = require("cors");
const { PORT, API_VERSION } = process.env;
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.set("json spaces", 2);
app.set("socketio", io);
app.use("/static", express.static(__dirname + "/public"));
app.use(cors());
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("pages/index.ejs", { google_api_key: process.env.GOOGLE_API_KEY });
});

app.get("/signin", (req, res) => {
  res.render("pages/signin.ejs");
});

app.get("/profile", (req, res) => {
  res.render("pages/profile.ejs");
});

app.use(`/api/${API_VERSION}`, user);

server.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("update position", (data) => {
    const { id, pos } = data;
    console.log(
      `Server: new position ${JSON.stringify(
        pos
      )} received from ${JSON.stringify(id)}`
    );
    socket.broadcast.emit("update position", { id, pos });
  });
});
