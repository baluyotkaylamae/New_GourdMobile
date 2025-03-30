const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");
const { Chat } = require("./models/chat"); // Import the Chat model
const { User } = require("./models/user"); // Make sure you have the User model imported here
const cron = require("node-cron");

require("dotenv/config");

const app = express();
const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Replace with your frontend URL in production
//     methods: ["GET", "POST"],
//   },
// });

app.use(cors());
app.options("*", cors());

// Middleware
app.use(express.json());
// app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

// Routes
const usersRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const postsRoutes = require("./Posts/route/Posts");
const dashboard = require("./routes/Dashboard");
const GourdType = require("./routes/GourdMonitoring/GourdType");
const GourdVariety = require("./routes/GourdMonitoring/GourdTypeVariety");
const Monitoring = require("./routes/GourdMonitoring/Monitoring");
const chatRoutes = require("./chat/ChatController");
const Monitor = require("./models/Monitoring");

const api = process.env.API_URL;

app.use(`${api}/users`, usersRoutes);
app.use(`${api}/category`, categoryRoutes);
app.use(`${api}/posts`, postsRoutes);
app.use(`${api}/dashboards`, dashboard);
app.use(`${api}/GourdType`, GourdType);
app.use(`${api}/GourdVariety`, GourdVariety);
app.use(`${api}/Monitoring`, Monitoring);
app.use(`${api}/chat`, chatRoutes);

// Start the server
const SERVER = app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});

const io = new Server(SERVER, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
  },
});

const ONLINE_USERS = new Map();
// Socket.IO Chat Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  let userId;

  socket.on("joinRoom", (data) => {
    console.log(data);
    const { userId } = data;
    ONLINE_USERS.set(userId, socket);
  });
  // When user is set
  socket.on("setUser", async (id) => {
    userId = id;
    console.log(`User ${userId} is now online`);

    // Update user online status in the database
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Emit the "user-online" event to notify other users
      io.emit("user-online", userId); // Notify other users that the user is online
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  });

  // Listen for new messages

  socket.on("sendMessage", async (data) => {
    try {
      const onlineUser = ONLINE_USERS.get(data.userId);
      console.log(onlineUser);
      if (onlineUser) {

        console.log(data);
        onlineUser.emit("receiveMessage", data);
      }

      // const newMessage = new Chat({ user, message, room });
      // const savedMessage = await newMessage.save();

      // // Emit the message to the room
      // io.to(room).emit("receiveMessage", savedMessage);
      // console.log(`Message from ${user} in room ${room}: ${message}`);

    } catch (error) {
      console.error("Error saving and emitting message:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);

    if (userId) {
      try {
        // Update user online status to false
        await User.findByIdAndUpdate(userId, { isOnline: false });
        console.log(`User ${userId} is now offline`);

        // Emit the "user-offline" event to notify other users
        io.emit("user-offline", userId); // Notify other users that the user is offline
      } catch (error) {
        console.error("Error updating offline status:", error);
      }
    }
  });
});

// Database connection
mongoose
  .connect(process.env.CONNECTION_STRING, {
    dbName: "GourdMobile",
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

cron.schedule("*/2 * * * *", async () => {
  console.log("Running scheduled job to update monitoring statuses...");

  try {
    // Get the current date and time
    const currentDate = new Date();

    // Find monitoring records where:
    // - `dateOfFinalization` is 7 or more days in the past
    // - `status` is not "Completed" or "Failed"
    const recordsToUpdate = await Monitor.find({
      dateOfFinalization: { $lte: new Date(currentDate.setDate(currentDate.getDate() - 7)) }, // 7 days in the past
      status: { $nin: ["Completed", "Failed"] }, // Exclude already finalized records
    });

    // Update the status of the matching records
    for (const record of recordsToUpdate) {
      const previousStatus = record.status; // Store the previous status

      if (!record.fruitsHarvested || record.fruitsHarvested === 0) {
        record.status = "Failed"; // Set the status to 'Failed' if no fruits were harvested
      } else if (record.fruitsHarvested >= 1) {
        record.status = "Completed"; // Set the status to 'Completed' if fruits were harvested
      }

      // Save the updated record
      await record.save();

      // Log the previous and updated statuses
      console.log(
        `Updated monitoring record with ID: ${record._id}, Previous Status: ${previousStatus}, New Status: ${record.status}`
      );
    }

    console.log("Scheduled job completed.");
  } catch (error) {
    console.error("Error running scheduled job:", error);
  }
});
