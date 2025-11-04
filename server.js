const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/projectTask");
const projectRoutes = require("./routes/project");
const authRoutes = require("./routes/auth");
const timeLogRoutes = require("./routes/timeLog");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timelogs", timeLogRoutes);

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
