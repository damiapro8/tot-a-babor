const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

// Serveix fitxers estàtics
app.use(express.static(path.join(__dirname, "..")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

let jugadors = {};

io.on("connection", socket => {
  jugadors[socket.id] = { x: 0, y: 0 };

  socket.on("update", pos => {
    jugadors[socket.id] = pos;
    io.emit("state", jugadors);
  });

  socket.on("disconnect", () => {
    delete jugadors[socket.id];
    io.emit("state", jugadors);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Servidor escoltant al port", port);
});
