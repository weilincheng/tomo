const express = require("express");
const app = express();
const port = 3000;
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
app.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
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
