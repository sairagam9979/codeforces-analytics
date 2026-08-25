const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getRecommendations } = require("../controller/recommendationController");

const router = express.Router();

router.post("/", authMiddleware, getRecommendations);

module.exports = router;
