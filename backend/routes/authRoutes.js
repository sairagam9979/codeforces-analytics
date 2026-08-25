const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { registerUser, loginUser, getMe } = require("../controller/authcontroller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;
