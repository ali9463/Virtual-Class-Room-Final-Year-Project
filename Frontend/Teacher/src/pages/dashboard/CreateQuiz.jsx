import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { Edit2, Trash2, Download, Upload, X, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateQuiz() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    courseName: "",
    year: "",
    department: "",
    section: "",
    startDate: "",
    dueDate: "",
    marks: "",
    file: null,
  });

  const [quizzes, setQuizzes] = useState([]);
  const [years, setYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:7000";

  // Fetch quizzes, years, and departments on mount
  useEffect(() => {
    if (token) {
      fetchQuizzes();
      fetchYears();
      fetchDepartments();
    }
  }, [token]);

  const fetchYears = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/years`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setYears(res.data || []);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get(`${API}/api/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(response.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF and DOCX files are allowed");
        setFileName("");
        return;
      }
      setFormData({ ...formData, file });
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.courseName ||
      !formData.year ||
      !formData.department ||
      !formData.section ||
      !formData.startDate ||
      !formData.dueDate ||
      !formData.marks
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("courseName", formData.courseName);
      data.append("year", formData.year);
      data.append("department", formData.department);
      data.append("section", formData.section);
      data.append("startDate", formData.startDate);
      data.append("dueDate", formData.dueDate);
      data.append("marks", formData.marks);
      if (formData.file) {
        data.append("file", formData.file);
      }

      if (editingId) {
        // Update quiz
        await axios.put(`${API}/api/quizzes/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Quiz updated successfully!");
        setEditingId(null);
      } else {
        // Create new quiz
        await axios.post(`${API}/api/quizzes`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Quiz created successfully!");
      }

      setFormData({
        title: "",
        courseName: "",
        year: "",
        department: "",
        section: "",
        startDate: "",
        dueDate: "",
        marks: "",
        file: null,
      });
      setFileName("");
      fetchQuizzes();
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quiz) => {
    setFormData({
      title: quiz.title,
      courseName: quiz.courseName,
      year: quiz.year || "",
      department: quiz.department || "",
      section: quiz.section,
      startDate: quiz.startDate.split("T")[0],
      dueDate: quiz.dueDate.split("T")[0],
      marks: quiz.marks,
      file: null,
    });
    setFileName(quiz.fileName || "");
    setEditingId(quiz._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await axios.delete(`${API}/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Quiz deleted successfully!");
      fetchQuizzes();
    } catch (err) {
      console.error("Error deleting quiz:", err);
      toast.error("Failed to delete quiz");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      courseName: "",
      year: "",
      department: "",
      section: "",
      startDate: "",
      dueDate: "",
      marks: "",
      file: null,
    });
    setFileName("");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl font-bold mb-6 text-white">Manage Quizzes</h1>

      {/* Create/Edit Form */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20 mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">
          {editingId ? "Edit Quiz" : "Create New Quiz"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Quiz title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Course Name *</label>
              <input
                type="text"
                name="courseName"
                placeholder="e.g., Web Development"
                value={formData.courseName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Year *</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year._id} value={year.code}>
                    {year.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.code}>
                    {dept.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Section *</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              >
                <option value="">Select Section</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Total Marks *</label>
              <input
                type="number"
                name="marks"
                placeholder="e.g., 50"
                value={formData.marks}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Upload File (PDF/DOCX)</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 border border-gray-600 rounded cursor-pointer hover:border-cyan-500 transition-colors">
                <Upload className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">{fileName || "Choose file"}</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {fileName && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, file: null }));
                    setFileName("");
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Saving..." : editingId ? "Update Quiz" : "Create Quiz"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Quizzes List */}
      <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
        <h2 className="text-xl font-bold mb-4 text-white">Quizzes ({quizzes.length})</h2>

        {quizzes.length === 0 ? (
          <div className="text-gray-400">No quizzes created yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex-1">{quiz.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-2">{quiz.courseName}</p>
                <p className="text-xs text-cyan-400 font-semibold mb-2">Section: {quiz.section} | Marks: {quiz.marks}</p>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>Start: {new Date(quiz.startDate).toLocaleDateString()}</p>
                  <p>Due: {new Date(quiz.dueDate).toLocaleDateString()}</p>
                </div>

                {quiz.fileUrl && (
                  <a
                    href={quiz.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    {quiz.fileName}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
