const express = require("express");
const router = express.Router();
const {
  registerToken,
  getForClass,
} = require("../controllers/notificationController");
const auth = require("../middlewares/auth");

router.post("/register-token", auth, registerToken);
router.get("/", auth, getForClass);

module.exports = router;
