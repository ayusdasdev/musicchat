const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

// CORS: allow the frontend URL(s) set in CLIENT_URL (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser tools (curl, Postman) which send no Origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json("All ok!");
});

// Define Routes
app.use("/api/users", require("./routes/api/user"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
