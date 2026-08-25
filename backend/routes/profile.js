const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserAnalytics } = require("../controller/profilefetching");
const {
    updateHandle,
    getMyAnalytics,
    compareWithHandle
} = require("../controller/profilecontroller");

const router = express.Router();

router.get("/analytics", getUserAnalytics);
router.put("/handle", authMiddleware, updateHandle);
router.get("/me", authMiddleware, getMyAnalytics);
router.get("/compare/:handle", authMiddleware, compareWithHandle);

module.exports = router;
