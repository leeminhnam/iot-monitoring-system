const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const cors = require("cors");
app.use(cors());

app.use(express.json());

const mongoose = require("mongoose");
require("dotenv").config();

// Socket.IO and MQTT
const { initSocket } = require("./services/socketService");
const { initMqtt } = require("./services/mqttService");
initSocket(server);
initMqtt();

const AuthRoutes = require("./routes/authRoutes");
app.use("/api/login", AuthRoutes);

const { verifyToken } = require("./middlewares/verifyToken");
app.use("/api", (req, res, next) => {
  verifyToken(req, res, next);
});

const UserRoutes = require("./routes/userRoutes");
app.use("/api/user", UserRoutes);

const SensorRoutes = require("./routes/sensorRoutes");
app.use("/api/sensors", SensorRoutes);

const ActionRoutes = require("./routes/actionRoutes");
app.use("/api/actions", ActionRoutes);

const DeviceRoutes = require("./routes/deviceRoutes");
app.use("/api/devices", DeviceRoutes);

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");

        server.listen(8080, () => {
            console.log("Server listening on port 8080");
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });