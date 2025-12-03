const User = require("../models/User");
const Teacher = require("../models/Teachers");
const Year = require("../models/Year");
const Department = require("../models/Department");
const Section = require("../models/Section");

// Get all years
exports.getYears = async (req, res) => {
  try {
    const years = await Year.find().sort({ code: -1 });
    res.json(years);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Create year
exports.createYear = async (req, res) => {
  try {
    const { code, label } = req.body;
    if (!code || !label) {
      return res.status(400).json({ message: "Code and label are required." });
    }
    const year = new Year({ code: code.toUpperCase(), label });
    await year.save();
    res.status(201).json(year);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Year code already exists." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// Update year
exports.updateYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, label } = req.body;
    const year = await Year.findByIdAndUpdate(
      id,
      { code: code?.toUpperCase(), label },
      { new: true }
    );
    if (!year) return res.status(404).json({ message: "Year not found." });
    res.json(year);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete year
exports.deleteYear = async (req, res) => {
  try {
    const { id } = req.params;
    const year = await Year.findByIdAndDelete(id);
    if (!year) return res.status(404).json({ message: "Year not found." });
    res.json({ message: "Year deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.find()
      .populate({
        path: "yearId",
        select: "_id code label",
      })
      .populate({
        path: "sections",
        select: "_id code",
      })
      .sort({ code: 1 });
    res.json(depts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { code, label, yearId } = req.body;
    if (!code || !label || !yearId) {
      return res
        .status(400)
        .json({ message: "Code, label, and year are required." });
    }
    const dept = new Department({
      code: code.toUpperCase(),
      label,
      yearId,
    });
    await dept.save();
    res.status(201).json(dept);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Department code already exists." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, label, yearId } = req.body;
    const dept = await Department.findByIdAndUpdate(
      id,
      { code: code?.toUpperCase(), label, yearId },
      { new: true }
    );
    if (!dept)
      return res.status(404).json({ message: "Department not found." });
    res.json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await Department.findByIdAndDelete(id);
    if (!dept)
      return res.status(404).json({ message: "Department not found." });
    res.json({ message: "Department deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    // Fetch students from User model
    const students = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch teachers from Teacher model
    const teachers = await Teacher.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Combine both
    const allUsers = [...students, ...teachers].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Update user (admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, rollYear, rollDept, rollSerial, section } =
      req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name;
    if (email) {
      const existingEmail = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmail)
        return res.status(400).json({ message: "Email already in use." });
      user.email = email.toLowerCase();
    }
    if (role) user.role = role;
    if (rollYear) user.rollYear = rollYear;
    if (rollDept) user.rollDept = rollDept;
    if (rollSerial) user.rollSerial = rollSerial;
    if (section) user.section = section;

    await user.save();
    res.json({ message: "User updated.", user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all sections
exports.getSections = async (req, res) => {
  try {
    const sections = await Section.find()
      .populate({
        path: "departmentId",
        select: "_id code label",
        populate: {
          path: "yearId",
          select: "_id code label",
        },
      })
      .sort({ code: 1 });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Get sections for a specific department
exports.getSectionsByDepartment = async (req, res) => {
  try {
    const { deptId } = req.params;
    const sections = await Section.find({ departmentId: deptId }).sort({
      code: 1,
    });
    res.json(sections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// Create section
exports.createSection = async (req, res) => {
  try {
    const { code, departmentId } = req.body;
    if (!code || !departmentId) {
      return res
        .status(400)
        .json({ message: "Code and department ID are required." });
    }

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ message: "Department not found." });
    }

    const section = new Section({
      code: code.toUpperCase(),
      departmentId,
    });
    await section.save();

    // Add section to department's sections array
    await Department.findByIdAndUpdate(departmentId, {
      $push: { sections: section._id },
    });

    const populatedSection = await section.populate("departmentId");
    res.status(201).json(populatedSection);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "This section already exists for this department." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByIdAndDelete(id);
    if (!section)
      return res.status(404).json({ message: "Section not found." });

    // Remove section from department
    await Department.findByIdAndUpdate(section.departmentId, {
      $pull: { sections: section._id },
    });

    res.json({ message: "Section deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
