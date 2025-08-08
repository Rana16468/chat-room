// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store registered students in memory (in production, use a database)
let registeredStudents = [];

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.emit("message", { message: "Socket successfully connected" });

  socket.on("register", (data) => {
    
    if (!data.studentId || !data.name || !data.email) {
      socket.emit("registration-error", {
        message: "Missing required fields",
        error: true
      });
      return;
    }

    const existingStudent = registeredStudents.find(s => s.studentId === data.studentId);
    if (existingStudent) {
      socket.emit("registration-error", {
        message: "Student ID already exists",
        error: true
      });
      return;
    }

    const newStudent = {
      ...data,
      registeredAt: new Date().toISOString(),
      socketId: socket.id
    };
    
    registeredStudents.push(newStudent);
    
    console.log("✅ Student registered successfully:", newStudent);
    

    socket.emit("registration-success", {
      message: "Student registered successfully",
      student: newStudent,
      totalStudents: registeredStudents.length
    });

    // Broadcast to all clients that a new student was registered
    socket.broadcast.emit("new-student-registered", {
      student: newStudent,
      totalStudents: registeredStudents.length
    });
  });

  // Handle getting all students
  // socket.on("get-students", () => {
  //   socket.emit("students-list", {
  //     students: registeredStudents,
  //     total: registeredStudents.length
  //   });
  // });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send({ 
    message: "Server is successfully running",
    totalRegisteredStudents: registeredStudents.length
  });
});

// REST API endpoint to get students
app.get("/api/students", (req, res) => {
  res.json({
    students: registeredStudents,
    total: registeredStudents.length
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});