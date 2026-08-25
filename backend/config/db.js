const mongoose = require("mongoose");

const connectDb = async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coding-profile-analyzer";
    try {
        await mongoose.connect(mongoUri);
        console.log("database connected");
    } catch (err) {
        console.error("Database connection error:", err.message);
        throw err;
    }
};

module.exports = connectDb;