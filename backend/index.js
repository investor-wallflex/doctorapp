const express = require("express");
require("dotenv").config(); // Load environment variables
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const { connectToDB } = require("./config/db"); // Import the updated database connection function
const { v4: uuidV4 } = require("uuid");
const { sendEmail } = require("./nodemailer/sendingEmail");

// Import routes
const { patientRoute } = require("./route/patientRoute");
const { doctorRoute } = require("./route/doctorRoute");
const { appointmentRoute } = require("./route/appointmentRoute");
const { adminRoute } = require("./route/adminRoute");

// Variable to store the connected database
let database;

// Initialize the database connection
async function initializeDB() {
    try {
        database = await connectToDB(); // Connect to MongoDB
        console.log("Database connection established!");
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1); // Exit the app if the database connection fails
    }
}

// Call the database initialization before starting the server
initializeDB();

// Example endpoint to use the database
app.get("/example", async (req, res) => {
    try {
        const collection = database.collection("exampleCollection"); // Replace with your actual collection name
        const data = await collection.find().toArray();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ message: "Error fetching data", error });
    }
});

// Home route
app.get("/", async (req, res) => {
    res.status(200).send("Welcome to Hospital Management Backend");
});

// Email route
app.post("/email", async (req, res) => {
    const { email, url } = req.body;
    try {
        sendEmail({
            email: email,
            subject: `Video Call link`,
            body: url,
        });

        res.send({ message: "EMAIL sent" });
    } catch (err) {
        res.send({ message: "Error sending email", error: err.message });
    }
});

// Redirect routes
app.use("/patients", patientRoute);
app.use("/doctors", doctorRoute);
app.use("/appointments", appointmentRoute);
app.use("/admin", adminRoute);

// Video call routes
app.get("/video", (req, res) => {
    res.redirect(`/video/${uuidV4()}`);
});

app.get("/video/:room", (req, res) => {
    res.send({ roomId: req.params.room });
});

// WebSocket connection for video calls
const server = require("http").Server(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
        socket.on("disconnect", () => {
            socket.emit("user-disconnected", userId);
        });
    });
});

// Start the server
server.listen(process.env.PORT, () => {
    console.log(`Listening at Port ${process.env.PORT}`);
});
