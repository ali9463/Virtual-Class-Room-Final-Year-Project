const express = require("express");
const connectDB = require("./db/db");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// enable CORS early
app.use(cors());

// connect to database
connectDB();

// mount routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// admin routes
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// upload route (Cloudinary)
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// assignment routes
const assignmentRoutes = require("./routes/assignment");
app.use("/api/assignments", assignmentRoutes);

// quiz routes
const quizRoutes = require("./routes/quiz");
app.use("/api/quizzes", quizRoutes);

// student assignment routes
const studentAssignmentRoutes = require("./routes/studentAssignments");
app.use("/api/student-assignments", studentAssignmentRoutes);

// student quiz routes
const studentQuizRoutes = require("./routes/studentQuizzes");
app.use("/api/student-quizzes", studentQuizRoutes);

app.get("/", (req, res) =>
  res.send("Hello, Online Virtual Class Room Backend!")
);

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
