const express = require("express");
const router = express.Router();
const {
  adminLogin,
  signup,
  signin,
  updateProfile,
  checkEmail,
  sendOTP,
  verifyOTP,
} = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.post("/admin-login", adminLogin);
router.post("/signup", signup);
router.post("/signin", signin);
router.put("/profile", auth, updateProfile);
router.post("/check-email", checkEmail);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
