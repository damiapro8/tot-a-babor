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

app.use(express.static(path.join(__dirname, "..")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

let jugadors = {};

io.on("connection", socket => {
  jugadors[socket.id] = { x: 0, y: 0, nom: "Jugador" };

  socket.on("nomJugador", nom => {
    if (jugadors[socket.id]) {
      jugadors[socket.id].nom = nom;
    }
  });

  socket.on("update", pos => {
    if (jugadors[socket.id]) {
      jugadors[socket.id].x = pos.x;
      jugadors[socket.id].y = pos.y;
      if (pos.nom) {
        jugadors[socket.id].nom = pos.nom;
      }
    }
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
