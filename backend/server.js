const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.json());

const mongoose = require("mongoose");
require("dotenv").config();

const AuthRoutes = require("./routes/authRoutes");
app.use("/api/login", AuthRoutes);

const { verifyToken } = require("./middlewares/verifyToken");
app.use("/api", verifyToken);

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");

        app.listen(8080, () => {
            console.log("Server listening on port 8080");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });