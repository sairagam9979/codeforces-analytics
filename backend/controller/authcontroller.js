const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    codeforcesHandle: user.codeforcesHandle || null
});

const createToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev-secret", {
        expiresIn: "7d"
    });

const registerUser = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email: normalizedEmail,
            password: hashedPassword,
            name
        });

        const token = createToken(newUser._id);

        return res.status(201).json({
            message: "Registration successful",
            token,
            user: sanitizeUser(newUser)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = createToken(user._id);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getMe = async (req, res) => {
    return res.json({ user: sanitizeUser(req.user) });
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};
