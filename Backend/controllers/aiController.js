// Use global fetch when available (Node 18+). Fall back to dynamic import of node-fetch if needed.
let fetcher = global.fetch;
if (!fetcher) {
  fetcher = async (...args) => {
    const mod = await import("node-fetch");
    return mod.default(...args);
  };
}
const User = require("../models/User");
const StudentSubmission = require("../models/StudentSubmission");
const StudentQuizSubmission = require("../models/StudentQuizSubmission");
const Meeting = require("../models/Meeting");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// POST /api/ai/chat
// body: { message }
// optional file upload field: file
exports.chat = async (req, res) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiUrl || !apiKey) {
      return res
        .status(500)
        .json({
          message:
            "AI API not configured on server. Set GEMINI_API_URL and GEMINI_API_KEY.",
        });
    }

    const { message } = req.body;
    const userId = req.user?.id;

    // Build context: user profile, recent submissions, upcoming meetings
    const user = userId
      ? await User.findById(userId).select("-password").lean()
      : null;

    const submissions = userId
      ? await StudentSubmission.find({ studentId: userId })
          .sort({ submittedAt: -1 })
          .limit(20)
          .lean()
      : [];
    const quizSubs = userId
      ? await StudentQuizSubmission.find({ studentId: userId })
          .sort({ submittedAt: -1 })
          .limit(20)
          .lean()
      : [];
    const meetings = user
      ? await Meeting.find({
          year: user.rollYear,
          department: user.rollDept,
          section: user.section,
          startsAt: { $gte: new Date() },
        })
          .sort({ startsAt: 1 })
          .limit(10)
          .lean()
      : [];

    // If file uploaded, store to cloudinary and include URL
    let uploadedFileUrl = null;
    if (req.file) {
      const streamUpload = (fileBuffer, filename) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "ai_uploads",
              resource_type: "raw",
              public_id: `${Date.now()}-${filename}`,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            },
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });

      try {
        uploadedFileUrl = await streamUpload(
          req.file.buffer,
          req.file.originalname,
        );
      } catch (err) {
        console.error("Cloudinary upload failed", err);
      }
    }

    // Build a prompt context for the model
    const parts = [];
    if (user)
      parts.push(
        `Student: ${user.name} (roll: ${user.rollYear}-${user.rollDept}-${user.section})`,
      );
    if (submissions.length)
      parts.push(
        `Recent assignment submissions: ${submissions
          .slice(0, 5)
          .map(
            (s) =>
              `${s.assignmentTitle || s.assignmentId || s._id} (marks:${s.marks ?? "N/A"})`,
          )
          .join("; ")}`,
      );
    if (quizSubs.length)
      parts.push(
        `Recent quiz submissions: ${quizSubs
          .slice(0, 5)
          .map(
            (s) =>
              `${s.quizTitle || s.quizId || s._id} (marks:${s.marks ?? "N/A"})`,
          )
          .join("; ")}`,
      );
    if (meetings.length)
      parts.push(
        `Upcoming meetings: ${meetings
          .slice(0, 5)
          .map((m) => `${m.title} at ${m.startsAt}`)
          .join("; ")}`,
      );
    if (uploadedFileUrl) parts.push(`Attached file: ${uploadedFileUrl}`);

    parts.push(`User question: ${message}`);

    const prompt = parts.join("\n\n");

    // Call external Gemini-like API. The exact payload depends on provider; this is a simple POST with { prompt }.
    const response = await fetcher(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI API error", text);
      return res
        .status(500)
        .json({ message: "AI provider error", detail: text });
    }

    const data = await response.json();

    // Expect provider to return { reply: '...' } or raw text
    const reply =
      data.reply || data.output || data.text || JSON.stringify(data);

    res.json({ reply });
  } catch (err) {
    console.error("AI chat error", err);
    res.status(500).json({ message: "Server error" });
  }
};
