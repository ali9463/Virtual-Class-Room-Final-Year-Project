const express = require("express");
const router = express.Router();
const {
  adminLogin,
  signup,
  signin,
  updateProfile,
} = require("../controllers/authController");
const auth = require("../middlewares/auth");

router.post("/admin-login", adminLogin);
router.post("/signup", signup);
router.post("/signin", signin);
router.put("/profile", auth, updateProfile);

module.exports = router;
