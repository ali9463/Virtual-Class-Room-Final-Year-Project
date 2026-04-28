const AttendanceRecord = require("../models/AttendanceRecord");
const User = require("../models/User");

// Get students by class filters: ?year=2024&department=CS&section=A
exports.getStudentsByClass = async (req, res) => {
  try {
    const { year, department, section } = req.query;
    const query = { role: "student" };
    if (year) query.rollYear = year;
    if (department) query.rollDept = department;
    if (section) query.section = section;

    const students = await User.find(query).select(
      "_id name email rollNumber section rollYear rollDept",
    );
    // return array directly for frontend convenience
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// List attendance records with optional filters
exports.getAttendance = async (req, res) => {
  try {
    const { studentId, dateFrom, dateTo } = req.query;
    const q = {};
    if (studentId) q.student = studentId;
    if (dateFrom || dateTo) q.date = {};
    if (dateFrom) q.date.$gte = new Date(dateFrom);
    if (dateTo) q.date.$lte = new Date(dateTo);

    const records = await AttendanceRecord.find(q).populate(
      "student",
      "name email rollNumber",
    );
    // return array directly
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark attendance: expects { studentId, date, status, course, year, department, section }
exports.markAttendance = async (req, res) => {
  try {
    const {
      studentId,
      date,
      status,
      course,
      year,
      department,
      section,
      attendance,
    } = req.body;
    // accept `courseId` alias from frontend
    const courseId = course || req.body.courseId || null;

    const recordDate = new Date(date);

    // If `attendance` array is provided, perform bulk upsert
    if (Array.isArray(attendance)) {
      const ops = attendance.map((item) => {
        const sid = item.student || item.studentId || item.student_id;
        const st = item.status || item.stat || item;
        return {
          updateOne: {
            filter: {
              student: sid,
              date: recordDate,
              course: courseId || null,
            },
            update: {
              student: sid,
              date: recordDate,
              status: st,
              course: courseId || null,
              markedBy: req.user ? req.user._id : null,
              year: year || "",
              department: department || "",
              section: section || "",
            },
            upsert: true,
          },
        };
      });

      if (ops.length) {
        await AttendanceRecord.bulkWrite(ops);
      }

      return res.json({ success: true, message: "Attendance marked (bulk)" });
    }

    // Single record flow
    if (!studentId || !date || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Upsert single record
    const rec = await AttendanceRecord.findOneAndUpdate(
      { student: studentId, date: recordDate, course: courseId || null },
      {
        student: studentId,
        date: recordDate,
        status,
        course: courseId || null,
        markedBy: req.user ? req.user._id : null,
        year: year || "",
        department: department || "",
        section: section || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ success: true, record: rec });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get attendance stats for a student
exports.getAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId)
      return res
        .status(400)
        .json({ success: false, message: "studentId required" });

    const total = await AttendanceRecord.countDocuments({ student: studentId });
    const present = await AttendanceRecord.countDocuments({
      student: studentId,
      status: "present",
    });
    const absent = total - present;

    res.json({ success: true, stats: { total, present, absent } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Export attendance - simple JSON export
exports.exportAttendance = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const q = {};
    if (dateFrom || dateTo) q.date = {};
    if (dateFrom) q.date.$gte = new Date(dateFrom);
    if (dateTo) q.date.$lte = new Date(dateTo);

    const records = await AttendanceRecord.find(q).populate(
      "student",
      "name email rollNumber",
    );
    // return array directly
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
