require("dotenv").config();
const { GOOGLE_API_KEY, SOCKET_HOST } = process.env;
const express = require("express");
const user = require("./server/routes/user_route");
const message = require("./server/routes/message_route");
const notifications = require("./server/routes/notifications_route");
const location = require("./server/routes/location_route");
const interests = require("./server/routes/interests_route");
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
const { rateLimiter } = require("./utilities/rate_limiting.js");

app.use(express.json());
app.set("json spaces", 2);
app.set("socketio", io);
app.use("/static", express.static(__dirname + "/public"));
app.use(cors());
app.set("view engine", "ejs");

app.use(rateLimiter());

app.get("/", (req, res) => {
  res.render("pages/landing_page.ejs");
});

app.get("/map", (req, res) => {
  res.render("pages/map.ejs", {
    google_api_key: GOOGLE_API_KEY,
    socket_host: SOCKET_HOST,
  });
});

app.get("/signin", (req, res) => {
  res.render("pages/signin.ejs");
});

app.get("/signup", (req, res) => {
  res.render("pages/signup.ejs");
});

app.get("/user/edit", (req, res) => {
  res.render("pages/edit_profile.ejs", {
    google_api_key: GOOGLE_API_KEY,
  });
});

app.get("/user/:userId", (req, res) => {
  res.render("pages/profile.ejs", { userId: req.params.userId });
});

app.get("/messages", (req, res) => {
  res.render("pages/messages.ejs", {
    socket_host: SOCKET_HOST,
  });
});

app.get("/notifications", (req, res) => {
  res.render("pages/notifications.ejs");
});

app.use(`/api/${API_VERSION}`, [
  user,
  message,
  notifications,
  location,
  interests,
]);
app.use(`/api/${API_VERSION}`, (req, res) => {
  res.status(404).json({ error: `End point does not exist` });
});

app.use((req, res) => {
  res.status(404).render("pages/404.ejs");
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "Internal Server Error" });
});

server.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  const { currentUserName, currentUserId } = socket.handshake.auth;
  socket.userName = currentUserName;
  socket.userId = currentUserId;
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    if (!socket.userName) continue;
    users.push({
      userId: socket.userId,
      socketId: id,
      userName: socket.userName,
    });
  }
  io.emit("users", users);

  socket.on(
    "private message",
    ({
      currentUserName,
      currentUserId,
      targetUserId,
      content,
      to,
      currentDate,
    }) => {
      socket.to(to).emit("private message", {
        currentUserName,
        currentUserId,
        targetUserId,
        content,
        from: socket.id,
        currentDate,
      });
    }
  );

  socket.on("update position", (data) => {
    const { socketId, userId, pos, name, location, website, profileImage } =
      data;
    socket.broadcast.emit("update position", {
      socketId,
      userId,
      pos,
      name,
      location,
      website,
      profileImage,
    });
  });

  socket.on("disconnecting", () => {
    const disconnectingUserId = socket.userId;
    io.emit("user disconnecting", { disconnectingUserId });
  });
});

module.exports = app;
