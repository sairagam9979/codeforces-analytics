const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getFriends, addFriend, removeFriend } = require("../controller/friendsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getFriends);
router.post("/add", addFriend);
router.delete("/:handle", removeFriend);

module.exports = router;
