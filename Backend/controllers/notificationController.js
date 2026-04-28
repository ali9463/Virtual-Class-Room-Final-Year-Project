const {
  registerTokenForUser,
  getNotificationsForClass,
} = require("../utils/notificationService");
const DeviceToken = require("../models/DeviceToken");

exports.registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user?.id;
    if (!token || !userId)
      return res.status(400).json({ message: "Invalid request" });

    // Build topic from user class if available
    const user = req.user;
    const topic =
      user?.rollYear && user?.rollDept && user?.section
        ? `${user.rollYear}-${user.rollDept}-${user.section}`
        : null;

    await registerTokenForUser(userId, token, topic);
    res.json({ message: "Token registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getForClass = async (req, res) => {
  try {
    const user = req.user;
    const targetClass =
      user?.rollYear && user?.rollDept && user?.section
        ? `${user.rollYear}-${user.rollDept}-${user.section}`
        : null;
    if (!targetClass) return res.json([]);
    const notes = await getNotificationsForClass(targetClass);
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
