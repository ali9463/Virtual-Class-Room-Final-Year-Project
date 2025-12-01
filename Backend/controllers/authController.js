const User = require("../models/User");
const Teacher = require("../models/Teachers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Fixed admin credentials
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123456";

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check against fixed admin credentials
    if (
      email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      return res.status(400).json({ message: "Invalid admin credentials." });
    }

    // Create admin token
    const payload = { id: "admin", role: "admin" };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        id: "admin",
        name: "Administrator",
        email: ADMIN_EMAIL,
        role: "admin",
        profileImage: null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      rollYear,
      rollDept,
      rollSerial,
      section,
      department,
      profileImage,
    } = req.body;

    if (!firstName || !lastName || !password) {
      return res
        .status(400)
        .json({ message: "First name, last name, and password are required." });
    }

    const name = `${firstName} ${lastName}`;
    const userRole = role ? role.toLowerCase() : "student";

    // For students, all roll components and profile image are required
    if (userRole === "student") {
      if (!email || !rollYear || !rollDept || !rollSerial || !section) {
        return res.status(400).json({
          message:
            "Email and roll number components (year, dept, serial) and section are required for students.",
        });
      }
      if (!profileImage) {
        return res.status(400).json({
          message: "Profile picture is required for students.",
        });
      }
      // Validate section (only A, B, C, D, E, F allowed)
      if (!["A", "B", "C", "D", "E", "F"].includes(section.toUpperCase())) {
        return res.status(400).json({
          message: "Section must be Filled",
        });
      }
    } else if (userRole === "teacher") {
      // For teachers, email, department, and profile image are required
      if (!email || !department) {
        return res
          .status(400)
          .json({ message: "Email and department are required for teachers." });
      }
      if (!profileImage) {
        return res.status(400).json({
          message: "Profile picture is required for teachers.",
        });
      }
    }

    const existingEmail = await User.findOne({ email: email?.toLowerCase() });
    if (existingEmail)
      return res.status(400).json({ message: "Email already in use." });

    if (userRole === "student") {
      const constructedRoll = (rollYear + rollDept + rollSerial).toLowerCase();
      const existingRoll = await User.findOne({ rollNumber: constructedRoll });
      if (existingRoll)
        return res
          .status(400)
          .json({ message: "Roll number already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    if (userRole === "teacher") {
      // Create Teacher record
      const teacherData = {
        name,
        email: email.toLowerCase(),
        password: hashed,
        department,
        profileImage: profileImage || null,
        role: "teacher",
      };
      const teacher = new Teacher(teacherData);
      await teacher.save();
      return res
        .status(201)
        .json({ message: "Teacher registered successfully." });
    } else {
      // Create Student record (role = student or admin)
      const userData = {
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: userRole,
        rollYear,
        rollDept,
        rollSerial,
        section: section.toUpperCase(),
        profileImage: profileImage || null,
      };
      const user = new User(userData);
      await user.save();
      return res.status(201).json({ message: "User registered successfully." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: "Missing credentials." });

    // Try to find in User model first (students/admin)
    let user = await User.findOne({
      email: identifier.toLowerCase(),
    });

    // If not found in User, try Teacher model
    if (!user) {
      user = await Teacher.findOne({
        email: identifier.toLowerCase(),
      });
    }

    // If still not found, try roll number (students only)
    if (!user && !identifier.includes("@")) {
      user = await User.findOne({
        rollNumber: identifier.toLowerCase(),
      });
    }

    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "7d",
    });

    // Build response based on user type
    const response = {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    };

    // Add roll fields for students
    if (user.rollNumber) {
      response.user.rollNumber = user.rollNumber;
      response.user.rollYear = user.rollYear;
      response.user.rollDept = user.rollDept;
      response.user.rollSerial = user.rollSerial;
      response.user.section = user.section;
    }

    // Add department for teachers
    if (user.department) {
      response.user.department = user.department;
    }

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { name, email, profileImage } = req.body;

    if (!id) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Try User model first (students)
    let user = await User.findById(id);
    let isTeacher = false;

    // If not found, try Teacher model
    if (!user) {
      user = await Teacher.findById(id);
      isTeacher = true;
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) user.name = name;
    if (email) {
      const Model = isTeacher ? Teacher : User;
      const existingEmail = await Model.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }
      user.email = email.toLowerCase();
    }
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const response = {
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    };

    // Add roll fields for students
    if (user.rollNumber) {
      response.user.rollNumber = user.rollNumber;
      response.user.rollYear = user.rollYear;
      response.user.rollDept = user.rollDept;
      response.user.rollSerial = user.rollSerial;
      response.user.section = user.section;
    }

    // Add department for teachers
    if (user.department) {
      response.user.department = user.department;
    }

    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
};
