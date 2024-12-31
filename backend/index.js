import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./Routes/userRoute.js";
import connectDB from "./dbs/dbs.js";
import jwt from "jsonwebtoken";  // For token-based authentication
import dotenv from "dotenv";
const app = express();

// CORS configuration to allow requests from the frontend
app.use(cors({
    origin: "http://localhost:5173",  // Ensure this matches the client origin
    credentials: true,  // Allow cookies to be sent with requests
    methods: ["GET", "POST", "PUT", "DELETE"], // Explicitly allow methods
    allowedHeaders: ["Content-Type", "Authorization"]  // Ensure Authorization header is allowed
  }))
dotenv.config();
app.use(express.json());
app.use(bodyParser.json());


// Connect to database
connectDB();

// Public Route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

// Protected Route
app.use("/api/v3/", router);  // Use authentication middleware on routes that need protection

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
