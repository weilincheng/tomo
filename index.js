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

app.use(express.static("public"));
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World!");
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
