const express = require("express");

const { Server } = require("socket.io");
const app = express();
const port = 3011;

const http = require("http");
const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("connected new user ");
  socket.join("kitchen-room");

  // first-room -1
  let sizeOfKitchen = io.sockets.adapter.rooms.get("kitchen-room").size;
  console.log("sizeOfKitchen: ", sizeOfKitchen);
  io.sockets
    .in("kitchen-room")
    .emit("cooking", {
      message: `Fride Rice Cooking In The Kitchen ${sizeOfKitchen}`,
    });

  io.sockets
    .in("kitchen-room")
    .emit("boiling", { message: "Water  Boiling In The Kitchen" });

  //second -room -2

  socket.join("bed-room");
  io.sockets
    .in("bed-room")
    .emit("sleep", { message: "I am Sleeping in the Bad Room" });
  io.sockets
    .in("bed-room")
    .emit("rest", { message: "I am Sleeping in the Rest Room" });

  socket.on("disconnect", () => {
    console.log("user disconnect");
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
