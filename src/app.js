import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import logger from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import compression from "compression"; // Import compression middleware

const app = express();

// Middleware
app.use(express.json());
app.use(compression()); // Use compression middleware
app.use(logger);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecom_db";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Basic Route
app.get('/', (req, res) => {
  res.send('E-commerce Backend API is running!');
});

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/products", productRoutes);

app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/shops", shopRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

// Error Handler
app.use(errorHandler);

// Export app for testing and server.js
export { app, connectDB, mongoose };
