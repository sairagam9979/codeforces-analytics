const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envPaths = [path.resolve(__dirname, ".env"), path.resolve(__dirname, "..", ".env")];
envPaths.forEach((envPath) => {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }
});

const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profile");
const friendsRoutes = require("./routes/friendsRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    return res.json({ message: "Coding Profile Analyzer API" });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/friends", friendsRoutes);
app.use("/recommendations", recommendationRoutes);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({ message: "Invalid JSON payload" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server due to DB connection error");
        process.exit(1);
    }
};

start();
